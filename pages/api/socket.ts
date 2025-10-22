import { Server, Socket } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "./socket.types";
import { Pool } from "pg";
import * as jose from "jose";
import { moderateMessage } from "../../src/utils/moderationUtils";

interface UserData {
  login: string;
  avatar: string;
  level: number;
  campus: string;
}

interface SocketWithUserData extends Socket {
  userData?: UserData;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_KEY as string,
});

async function getUserFromToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY as string);
    const { payload } = await jose.jwtVerify(token, secret);

    if (!payload.userData) {
      throw new Error("No user data in JWT");
    }

    return payload.userData as UserData;
  } catch {
    throw new Error("Invalid token");
  }
}

setInterval(async () => {
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM leets.chat_messages WHERE created_at < NOW() - INTERVAL '24 hours'`
    );
  } finally {
    client.release();
  }
}, 60 * 60 * 1000);

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = new Server(res.socket.server as any, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", async (socket: SocketWithUserData) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      console.log("🔌 New socket connection, authenticating user FIRST...");

      // AUTHENTICATE USER FIRST before registering any handlers
      try {
        const userData = await getUserFromToken(token);
        socket.userData = userData;
        console.log("✅ User authenticated:", userData.login);
      } catch (error) {
        console.error("❌ Error during authentication:", error);
        socket.disconnect();
        return;
      }

      console.log("📌 Now registering all event handlers...");

      // Client requests initial messages when ready
      socket.on("requestMessages", async () => {
        console.log(`📥 Client ${socket.userData!.login} requesting initial messages`);
        const client = await pool.connect();
        try {
          const messagesResult = await client.query(
            `SELECT 
              message_id as id,
              message,
              username,
              avatar,
              level,
              campus,
              FLOOR(EXTRACT(EPOCH FROM created_at) * 1000)::BIGINT as timestamp
            FROM leets.chat_messages 
            ORDER BY created_at DESC 
            LIMIT 20`
          );

          const messages = messagesResult.rows.reverse();

          for (const msg of messages) {
            const reactionsResult = await client.query(
              `SELECT emoji, COUNT(*)::BIGINT as count, ARRAY_AGG(username) as users
               FROM leets.chat_reactions
               WHERE message_id = $1
               GROUP BY emoji`,
              [msg.id]
            );
            msg.reactions = reactionsResult.rows;
          }

          const totalCountResult = await client.query(
            `SELECT COUNT(*)::INT as total FROM leets.chat_messages`
          );
          const totalMessages = totalCountResult.rows[0].total;

          console.log(`📨 Sending ${messages.length} initial messages to ${socket.userData!.login}`);
          socket.emit("previousMessages", { messages, hasMore: totalMessages > 20 });
        } catch (error) {
          console.error("❌ Error loading initial messages:", error);
        } finally {
          client.release();
        }
      });

      
      socket.on("sendMessage", async (data: { message: string }) => {
          if (!socket.userData) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }
          const socketUserData = socket.userData;

          const { message } = data;

          if (!message || typeof message !== "string") {
            socket.emit("error", { message: "Invalid message" });
            return;
          }

          const sanitizedMessage = message.trim().slice(0, 1000);

          if (sanitizedMessage.length === 0) {
            socket.emit("error", { message: "Message cannot be empty" });
            return;
          }

          // Moderate the message
          const moderationResult = moderateMessage(sanitizedMessage);

          const client = await pool.connect();
          try {
            const messageId = `${Date.now()}-${socket.id}-${Math.random().toString(36).substr(2, 9)}`;

            // Store original message in chat_messages
            const result = await client.query(
              `INSERT INTO leets.chat_messages (message_id, message, username, avatar, level, campus)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING 
                 message_id as id,
                 message,
                 username,
                 avatar,
                 level,
                 campus,
                 FLOOR(EXTRACT(EPOCH FROM created_at) * 1000)::BIGINT as timestamp`,
              [
                messageId,
                sanitizedMessage,
                socketUserData.login,
                socketUserData.avatar,
                socketUserData.level,
                socketUserData.campus,
              ]
            );

            const newMessage = result.rows[0];

            // If message is flagged, store in flagged_messages table
            if (moderationResult.blocked) {
              console.log(`🚨 Flagged message from ${socketUserData.login}:`, {
                categories: moderationResult.categories,
                severity: moderationResult.severity,
                terms: moderationResult.matched_terms?.length
              });

              await client.query(
                `INSERT INTO leets.chat_flagged_messages 
                 (message_id, message, username, avatar, level, campus, blocked, categories, matched_terms, severity)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                  messageId,
                  sanitizedMessage,
                  socketUserData.login,
                  socketUserData.avatar,
                  socketUserData.level,
                  socketUserData.campus,
                  true,
                  moderationResult.categories,
                  moderationResult.matched_terms,
                  moderationResult.severity
                ]
              );

              // Add moderation metadata to the message
              newMessage.flagged = true;
              newMessage.moderationCategories = moderationResult.categories;
              newMessage.moderationSeverity = moderationResult.severity;
            }

            io.emit("receiveMessage", newMessage);
          } catch {
            socket.emit("error", { message: "Failed to send message" });
          } finally {
            client.release();
          }
        });

        console.log("📌 Registering addReaction handler");
        socket.on("addReaction", async (data: { messageId: string; emoji: string }) => {
          console.log("🎯 Server received addReaction:", data, "from user:", socket.userData?.login);
          
          if (!socket.userData) {
            console.log("❌ Not authenticated");
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const { messageId, emoji } = data;
          if (!messageId || !emoji) {
            console.log("❌ Invalid reaction data");
            socket.emit("error", { message: "Invalid reaction data" });
            return;
          }

          const client = await pool.connect();
          try {
            console.log("📝 Inserting reaction into DB:", { messageId, username: socket.userData.login, emoji });
            
            const insertResult = await client.query(
              `INSERT INTO leets.chat_reactions (message_id, username, emoji)
               VALUES ($1, $2, $3)
               ON CONFLICT (message_id, username, emoji) DO NOTHING
               RETURNING *`,
              [messageId, socket.userData.login, emoji]
            );
            
            console.log("✅ Insert result:", insertResult.rows);

            const reactionsResult = await client.query(
              `SELECT emoji, COUNT(*)::BIGINT as count, ARRAY_AGG(username) as users
               FROM leets.chat_reactions
               WHERE message_id = $1
               GROUP BY emoji`,
              [messageId]
            );

            console.log("📊 Aggregated reactions:", reactionsResult.rows);
            console.log("📡 Broadcasting reactionUpdate to all clients");

            io.emit("reactionUpdate", {
              messageId,
              reactions: reactionsResult.rows,
            });
          } catch (error) {
            console.error("❌ Error adding reaction:", error);
            socket.emit("error", { message: "Failed to add reaction" });
          } finally {
            client.release();
          }
        });

        console.log("📌 Registering removeReaction handler");
        socket.on("removeReaction", async (data: { messageId: string; emoji: string }) => {
          console.log("🗑️ Server received removeReaction:", data, "from user:", socket.userData?.login);
          
          if (!socket.userData) {
            console.log("❌ Not authenticated");
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const { messageId, emoji } = data;
          if (!messageId || !emoji) {
            console.log("❌ Invalid reaction data");
            socket.emit("error", { message: "Invalid reaction data" });
            return;
          }

          const client = await pool.connect();
          try {
            console.log("🗑️ Deleting reaction from DB:", { messageId, username: socket.userData.login, emoji });
            
            const deleteResult = await client.query(
              `DELETE FROM leets.chat_reactions
               WHERE message_id = $1 AND username = $2 AND emoji = $3
               RETURNING *`,
              [messageId, socket.userData.login, emoji]
            );
            
            console.log("✅ Delete result:", deleteResult.rows);

            const reactionsResult = await client.query(
              `SELECT emoji, COUNT(*)::BIGINT as count, ARRAY_AGG(username) as users
               FROM leets.chat_reactions
               WHERE message_id = $1
               GROUP BY emoji`,
              [messageId]
            );

            console.log("📊 Aggregated reactions:", reactionsResult.rows);
            console.log("📡 Broadcasting reactionUpdate to all clients");

            io.emit("reactionUpdate", {
              messageId,
              reactions: reactionsResult.rows,
            });
          } catch (error) {
            console.error("❌ Error removing reaction:", error);
            socket.emit("error", { message: "Failed to remove reaction" });
          } finally {
            client.release();
          }
        });

        socket.on("loadMoreMessages", async (data: { offset: number }) => {
          console.log("📜 Loading more messages, offset:", data.offset);
          
          if (!socket.userData) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const client = await pool.connect();
          try {
            const messagesResult = await client.query(
              `SELECT 
                message_id as id,
                message,
                username,
                avatar,
                level,
                campus,
                FLOOR(EXTRACT(EPOCH FROM created_at) * 1000)::BIGINT as timestamp
              FROM leets.chat_messages 
              ORDER BY created_at DESC 
              LIMIT 20 OFFSET $1`,
              [data.offset]
            );

            const messages = messagesResult.rows.reverse();

            for (const msg of messages) {
              const reactionsResult = await client.query(
                `SELECT emoji, COUNT(*)::BIGINT as count, ARRAY_AGG(username) as users
                 FROM leets.chat_reactions
                 WHERE message_id = $1
                 GROUP BY emoji`,
                [msg.id]
              );
              msg.reactions = reactionsResult.rows;
            }

            console.log(`✅ Loaded ${messages.length} more messages`);
            socket.emit("moreMessages", { messages, hasMore: messages.length === 20 });
          } catch (error) {
            console.error("❌ Error loading more messages:", error);
            socket.emit("error", { message: "Failed to load more messages" });
          } finally {
            client.release();
          }
        });

        socket.on("disconnect", () => {});

      console.log("✅ All handlers registered, messages sent automatically on connection");
    });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default SocketHandler;
