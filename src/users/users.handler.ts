import { eq } from "drizzle-orm";
import db from "../db/drizzle";
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

  public async getUserById(dto: UserId): Promise<User> {
    this.log?.info("getUserById", dto);

    // Zod
    let dtoZod: UserId;
    try {
      dtoZod = UserIdZod.parse(dto);
    } catch (error) {
      throw this.myError.new("getUserById", 400, error);
    }

    try {
      const query = async () => {
        const result = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.id, dtoZod?.id));
        return result[0];
      };

      return this.redis.cache("getUserById", 10, query);
    } catch (error) {
      throw this.myError.new("getUserById", 500, error);
    }
  }

  public async createUser(dto: UserCreate): Promise<User> {
    this.log?.info("createUser", dto);

    // Zod
    let dtoZod: UserCreate;
    try {
      dtoZod = UserCreateZod.parse(dto);
    } catch (error) {
      throw this.myError.new("createUser", 400, error);
    }

    // Query
    try {
      const result = await db
        .insert(UsersTable)
        .values([{ ...dtoZod }])
        .returning();

      return result[0];
    } catch (error) {
      throw this.myError.new("createUser", 500, error);
    }
  }

  public async deleteUser(dto: UserId): Promise<User> {
    this.log?.info("deleteUser", dto);

    // Zod
    let dtoZod: UserId;
    try {
      dtoZod = UserIdZod.parse(dto);
    } catch (error) {
      throw this.myError.new("deleteUser", 400, error);
    }

    // Query
    try {
      const result = await db
        .delete(UsersTable)
        .where(eq(UsersTable.id, dtoZod?.id))
        .returning();

      return result[0];
    } catch (error) {
      throw this.myError.new("deleteUser", 500, error);
    }
  }
}
