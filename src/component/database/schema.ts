import type { DbTable } from "./database.types";

export const DB_TABLES: DbTable[] = [
  {
    id: "vip",
    schema: "leets",
    name: "vip",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "login", type: "TEXT" },
      { name: "token", type: "TEXT" },
      { name: "category", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "feedback",
    schema: "leets",
    name: "feedback",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "user_login", type: "TEXT" },
      { name: "user_email", type: "TEXT" },
      { name: "rating", type: "INTEGER" },
      { name: "badge_awarded", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "blocked_logins",
    schema: "leets",
    name: "blocked_logins",
    columns: [
      { name: "login", type: "TEXT", pk: true },
      { name: "source", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "notifications",
    schema: "public",
    name: "notifications",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "title", type: "VARCHAR" },
      { name: "message", type: "TEXT" },
      { name: "target_type", type: "VARCHAR" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    linksTo: ["user_notification_reads"],
  },
  {
    id: "user_notification_reads",
    schema: "public",
    name: "user_notification_reads",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "notification_id", type: "INTEGER", fk: "notifications.id" },
      { name: "user_id", type: "INTEGER" },
      { name: "seen_at", type: "TIMESTAMP" },
    ],
    linksTo: ["notifications"],
  },
  {
    id: "chat_messages",
    schema: "leets",
    name: "chat_messages",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "message_id", type: "TEXT" },
      { name: "message", type: "TEXT" },
      { name: "username", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    linksTo: ["chat_reactions", "chat_flagged_messages"],
  },
  {
    id: "chat_reactions",
    schema: "leets",
    name: "chat_reactions",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "message_id", type: "TEXT", fk: "chat_messages.message_id" },
      { name: "username", type: "TEXT" },
      { name: "emoji", type: "TEXT" },
    ],
    linksTo: ["chat_messages"],
  },
  {
    id: "chat_flagged_messages",
    schema: "leets",
    name: "chat_flagged_messages",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "message_id", type: "TEXT", fk: "chat_messages.message_id" },
      { name: "username", type: "TEXT" },
      { name: "severity", type: "TEXT" },
    ],
    linksTo: ["chat_messages"],
  },
  {
    id: "rate_limits",
    schema: "public",
    name: "rate_limits",
    columns: [
      { name: "identifier", type: "VARCHAR", pk: true },
      { name: "count", type: "INTEGER" },
      { name: "reset_time", type: "BIGINT" },
    ],
  },
];
