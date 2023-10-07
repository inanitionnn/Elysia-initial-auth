import { InferSelectModel } from "drizzle-orm";
import { UsersTable } from "../users.entity";

export type User = InferSelectModel<typeof UsersTable>;
