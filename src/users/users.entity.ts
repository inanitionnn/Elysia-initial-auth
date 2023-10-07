import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  boolean,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
export const roleEnum = pgEnum("role", ["admin", "user", "moder"]);

export const UsersTable = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  role: roleEnum("role").default("user").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 118 }).notNull(),
  image: varchar("image", { length: 255 }),
  activationId: uuid("activationLink"),
  resetPasswordId: uuid("resetPasswordId"),
  isActivated: boolean("isActivated").default(false).notNull(),
  isBanned: boolean("isBanned").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
