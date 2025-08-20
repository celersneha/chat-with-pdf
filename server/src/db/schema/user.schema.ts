import { pgTable, varchar, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userid: varchar("userid", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  uploadedFileCount: integer("uploaded_file_count").default(0),
  files: jsonb("files").default([]),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
