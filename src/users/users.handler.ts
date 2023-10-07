import { eq } from "drizzle-orm";
import db from "../db/drizzle";
import createError from "http-errors";
import { UsersTable } from "./users.entity";
import { Redis } from "../db";
import { logger } from "../log";
import { User, UserCreate, UserCreateZod, UserId, UserIdZod } from "./dto";
import { MyError } from "../error";

export class UsersHandler {
  private log;
  private myError;
  private redis;

  constructor(isLog = true) {
    if (isLog) {
      this.log = logger.child({ service: UsersHandler.name });
    }
    this.myError = new MyError(this.log);
    this.redis = new Redis();
  }

  public async getAllUsers(): Promise<User[]> {
    try {
      this.log?.info("getAllUsers");

      const query = async () => db.select().from(UsersTable);

      return this.redis.cache("getAllUsers", 10, query);
    } catch (error) {
      throw this.myError.new("getAllUsers", 500, error);
    }
  }

  public async getUserById(dto: UserId): Promise<User[]> {
    this.log?.info("getUserById", { id: dto.id });

    // Zod
    let dtoZod: UserId;
    try {
      dtoZod = UserIdZod.parse(dto);
    } catch (error) {
      this.myError.new("getUserById", 400, error);
    }

    try {
      this.log?.info("getAllUsers");

      const query = async () =>
        db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.id, dtoZod?.id));

      return this.redis.cache("getAllUsers", 10, query);
    } catch (error) {
      throw this.myError.new("getAllUsers", 500, error);
    }
  }

  public async createUser(dto: UserCreate): Promise<User> {
    if (this.log) this.log.info("createUser");

    // Zod
    let dtoZod: UserCreate;
    try {
      dtoZod = UserCreateZod.parse(dto);
    } catch ({ errors }: any) {
      this.log?.error("createUser", errors);
      throw createError(400, `${errors[0].message}.`);
    }

    // Query
    const result = await db
      .insert(UsersTable)
      .values([{ ...dtoZod }])
      .returning();

    return result[0];
  }

  public async deleteUser(dto: UserId): Promise<User> {
    if (this.log) this.log.info("deleteUser");

    // Zod
    let dtoZod: UserId;
    try {
      dtoZod = UserIdZod.parse(dto);
    } catch ({ errors }: any) {
      this.log?.error("deleteUser", errors);
      throw createError(400, `${errors[0].message}.`);
    }

    // Query
    const result = await db
      .delete(UsersTable)
      .where(eq(UsersTable.id, dtoZod?.id))
      .returning();

    return result[0];
  }
}
