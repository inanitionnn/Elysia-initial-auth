import { JWTPayloadSpec } from "@elysiajs/jwt";
import { MyError } from "../error";
import { UsersHandler } from "../users";
import { RoleType, User } from "../users/dto";

export class GuardsHandler {
  private usersHandler;
  private myError;
  constructor() {
    this.myError = new MyError();
    this.usersHandler = new UsersHandler();
  }

  public async roleGuard(
    userId: string,
    rolesWithAccess: RoleType[],
  ): Promise<User> {
    const user = await this.usersHandler.getUserById({ id: userId });
    if (!user) {
      throw this.myError.new("roleGuard", 404, "User not found");
    }
    if (!rolesWithAccess.includes(user.role)) {
      throw this.myError.new("roleGuard", 403, "You do not have access");
    }
    return user;
  }

  public async authGuard(
    bearer: string | undefined,
    jwtVerify: (
      jwt?: string | undefined,
    ) => Promise<false | (Record<string, string> & JWTPayloadSpec)>,
  ): Promise<User> {
    if (!bearer) {
      throw this.myError.new("AuthGuardRoute", 401, "Unauthorized");
    }

    const userJwt = await jwtVerify(bearer);

    if (!userJwt) {
      throw this.myError.new("AuthGuardRoute", 401, "Unauthorized");
    }

    const user = await this.usersHandler.getUserById({ id: userJwt.id });

    if (!user) {
      throw this.myError.new("AuthGuardRoute", 404, "User not found");
    }

    return user;
  }

  public async localGuard(email: string, password: string): Promise<User> {
    const user = await this.usersHandler.getUserByEmail({ email });
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

    if (!user.isActivated) {
      throw this.myError.new(
        "AuthGuardRoute",
        403,
        "Account in not activated. Please check your email",
      );
    }

    return user;
  }
}
