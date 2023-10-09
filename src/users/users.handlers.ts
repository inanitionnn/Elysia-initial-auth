import { eq } from "drizzle-orm";
import db from "../db/drizzle";
import { User, UserAddRole, UserCreate, UserZod, UsersTable } from "./user.entity";
import { Redis } from "../db";
import { logger } from "../log";
import { MyError } from "../error";

export class UsersHandlers {
  private log;
  private myError;
  private redis;

  constructor(isLog = true) {
    if (isLog) {
      this.log = logger.child({ service: UsersHandlers.name });
    }
    this.myError = new MyError(this.log);
    this.redis = new Redis();
  }
  //#region Get
  public async getAllUsers(): Promise<User[]> {
    this.log?.info("getAllUsers");
    try {
      const query = async () => db.select().from(UsersTable);
      return this.redis.cache("getAllUsers", 10, query);
    } catch (error) {
      throw this.myError.new("getAllUsers", 500, error);
    }
  }

  public async getUserById(userId: string): Promise<User | null> {
    this.log?.info("getUserById");

    // Zod
    try {
      UserZod.pick({ id: true }).parse({ id: userId });
    } catch (error) {
      throw this.myError.new("getUserById", 400, error);
    }

    // Query
    try {
      const query = async () => {
        const result = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.id, userId));
        if (result[0]) return result[0];
        return null;
      };

      return this.redis.cache(`getUserById:${userId}`, 10, query);
    } catch (error) {
      throw this.myError.new("getUserById", 500, error);
    }
  }

  public async getUserByEmail(userEmail: string): Promise<User | null> {
    this.log?.info("getUserByEmail");

    // Zod
    try {
      UserZod.pick({ email: true }).parse({ email: userEmail });
    } catch (error) {
      throw this.myError.new("getUserByEmail", 400, error);
    }

    // Query
    try {
      const query = async () => {
        const result = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.email, userEmail));
        if (result[0]) return result[0];
        return null;
      };
      const res = await this.redis.cache(
        `getUserByEmail:${userEmail}`,
        10,
        query,
      );

      return res;
    } catch (error) {
      throw this.myError.new("getUserByEmail", 500, error);
    }
  }
  //#endregion Get

  //#region Create
  public async createUser(dto: UserCreate): Promise<User> {
    this.log?.info("createUser");

    // Zod
    try {
      UserZod.pick({ name: true, email: true, password: true }).parse(dto);
    } catch (error) {
      throw this.myError.new("createUser", 400, error);
    }

    // Query
    try {
      const result = await db
        .insert(UsersTable)
        .values([{ ...dto }])
        .returning();

      return result[0];
    } catch (error) {
      throw this.myError.new("createUser", 500, error);
    }
  }
  //#endregion Create

  //#region Update
  public async addRoleToUser(dto: UserAddRole): Promise<User> {
    this.log?.info("addRoleToUser");

    // Zod
    try {
      UserZod.pick({ id: true, role: true }).parse(dto);
    } catch (error) {
      throw this.myError.new("addRoleToUser", 400, error);
    }

    // Check
    const user = await this.getUserById(dto.id);

    // Query
    try {
      const result = await db
        .update(UsersTable)
        .set(dto)
        .where(eq(UsersTable.id, dto.id))
        .returning();

      return result[0];
    } catch (error) {
      throw this.myError.new("addRoleToUser", 500, error);
    }
  }
  //#endregion

  //#region Delete
  public async deleteUser(userId: string): Promise<User | null> {
    this.log?.info("deleteUser");

    // Zod
    try {
      UserZod.pick({ id: true }).parse({ id: userId });
    } catch (error) {
      throw this.myError.new("addRoleToUser", 400, error);
    }

    // Query
    try {
      const result = await db
        .delete(UsersTable)
        .where(eq(UsersTable.id, userId))
        .returning();
      if (result[0]) return result[0];
      return null;
    } catch (error) {
      throw this.myError.new("deleteUser", 500, error);
    }
  }
  //#endregion Delete
}
