import { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { UsersTable } from "../users.entity";

export type UserId = Pick<InferSelectModel<typeof UsersTable>, "id">;
export const UserIdZod = createSelectSchema(UsersTable, {
  id: (schema) => schema.id.uuid(),
}).pick({ id: true });
