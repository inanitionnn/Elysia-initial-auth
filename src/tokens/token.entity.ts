import {
  pgTable,
  timestamp,
  uuid,
  uniqueIndex,
  bigint,
  char,
  index,
} from "drizzle-orm/pg-core";
import { UsersTable } from "../users/user.entity";
import { relations } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

export const TokensTable = pgTable(
  "tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uniqueId: char("uniqueId", { length: 21 }).notNull(),
    token: uuid("token").unique().notNull().defaultRandom(),
    userId: uuid("userId").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      tokenIdx: uniqueIndex("token_idx").on(table.token),
      userIdIdx: index("userId_idx").on(table.userId),
      uniqueIdIdx: uniqueIndex("uniqueId_idx").on(table.uniqueId, table.userId),
    };
  },
);

export const TokensRelations = relations(TokensTable, ({ one }) => ({
  user: one(UsersTable, {
    fields: [TokensTable.userId],
    references: [UsersTable.id],
  }),
}));

export const TokenZod = createSelectSchema(TokensTable, {
  uniqueId: (schema) => schema.uniqueId.length(21),
});
