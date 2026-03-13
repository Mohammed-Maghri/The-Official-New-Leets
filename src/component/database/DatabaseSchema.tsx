"use client";

import React from "react";
import { TableCard } from "./TableCard";
import { LinkedTables } from "./LinkedTables";
import { DB_TABLES } from "./schema";

export const DatabaseSchema: React.FC = () => {
  const vip = DB_TABLES.find((t) => t.id === "vip")!;
  const feedback = DB_TABLES.find((t) => t.id === "feedback")!;
  const blockedLogins = DB_TABLES.find((t) => t.id === "blocked_logins")!;
  const notifications = DB_TABLES.find((t) => t.id === "notifications")!;
  const userNotificationReads = DB_TABLES.find(
    (t) => t.id === "user_notification_reads"
  )!;
  const chatMessages = DB_TABLES.find((t) => t.id === "chat_messages")!;
  const chatReactions = DB_TABLES.find((t) => t.id === "chat_reactions")!;
  const chatFlagged = DB_TABLES.find((t) => t.id === "chat_flagged_messages")!;
  const rateLimits = DB_TABLES.find((t) => t.id === "rate_limits")!;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      style={{ fontFamily: "var(--font-pixel)" }}
    >
      <div className="min-w-0">
        <TableCard table={vip} />
      </div>
      <div className="min-w-0">
        <TableCard table={feedback} />
      </div>
      <div className="min-w-0">
        <TableCard table={blockedLogins} />
      </div>

      <div className="sm:col-span-2 lg:col-span-3 min-w-0">
        <LinkedTables tables={[notifications, userNotificationReads]} />
      </div>

      <div className="sm:col-span-2 lg:col-span-3 min-w-0">
        <LinkedTables
          tables={[chatMessages, chatReactions, chatFlagged]}
          linkLabel="refs"
        />
      </div>

      <div className="min-w-0">
        <TableCard table={rateLimits} />
      </div>
    </div>
  );
};
