import { Cookie } from "elysia";
import { Redis } from "../db";
import { MyError } from "../error";
import { logger } from "../log";
import { UsersHandler } from "../users";
import { User } from "../users/dto";

export class AuthHandler {
  private log;
  private myError;
  private redis;
  private usersHandler;

  constructor(isLog = true) {
    if (isLog) {
      this.log = logger.child({ service: AuthHandler.name });
    }
    this.myError = new MyError(this.log);
    this.redis = new Redis();
    this.usersHandler = new UsersHandler();
  }

  // public async registration(){
  // }

  public async login(user: User, cookie: Record<string, Cookie<any>>) {
    this.log?.info("login");
  }
}
// dto.password = await Bun.password.hash(dto.password);
