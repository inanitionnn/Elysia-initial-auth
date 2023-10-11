import { envConfig } from "../config";
import { MyError } from "../error";
import { RoleType, User, UsersHandlers } from "../users";
import jwt from "jsonwebtoken";

export class GuardsHandlers {
  private usersHandler;
  private myError;
  constructor() {
    this.myError = new MyError();
    this.usersHandler = new UsersHandlers();
  }

  public async roleGuard(
    userId: string,
    rolesWithAccess: RoleType[],
  ): Promise<User> {
    const user = await this.usersHandler.getUserById(userId);
    if (!user) {
      throw this.myError.new("roleGuard", 404, "User not found");
    }
    if (!rolesWithAccess.includes(user.role)) {
      throw this.myError.new("roleGuard", 403, "You do not have access");
    }
    return user;
  }

  public async authGuard(bearer: string | undefined): Promise<User> {
    if (!bearer) {
      throw this.myError.new("AuthGuardRoute", 401, "Missing jwt");
    }
    const secret = envConfig.get("JWT_SECRET");
    let userJwt;
    try {
      userJwt = jwt.verify(bearer, secret);
    } catch (error) {
      throw this.myError.new("AuthGuardRoute", 401, error);
    }

    if (typeof userJwt === "string") {
      throw this.myError.new("AuthGuardRoute", 401, "Invalid jwt");
    }

    const user = await this.usersHandler.getUserById(userJwt.id);

    if (!user) {
      throw this.myError.new("AuthGuardRoute", 404, "User not found");
    }

    return user;
  }

  public async localGuard(email: string, password: string): Promise<User> {
    const user = await this.usersHandler.getUserByEmail(email);
    if (!user) {
      throw this.myError.new("AuthGuardRoute", 404, "User not found");
    }

    const isValidPassword = await Bun.password.verify(password, user.password);
    if (!isValidPassword) {
      throw this.myError.new("AuthGuardRoute", 400, "Wrong password");
    }

    if (user.isBanned) {
      throw this.myError.new("AuthGuardRoute", 403, "Account in banned");
    }

    // if (!user.isActivated) {
    //   throw this.myError.new(
    //     "AuthGuardRoute",
    //     403,
    //     "Account in not activated. Please check your email",
    //   );
    // }

    return user;
  }
}
