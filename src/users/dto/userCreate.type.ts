import { InferInsertModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { UsersTable } from "../users.entity";

export type UserCreate = Pick<
  InferInsertModel<typeof UsersTable>,
  "name" | "email" | "password"
>;
export const UserCreateZod = createInsertSchema(UsersTable, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.length(118),
}).pick({ name: true, email: true, password: true });
