import { Cookie } from "elysia";
import { MyError } from "../error";
import { logger } from "../log";
import { TokensHandlers } from "../tokens";
import { User, UserZod, UsersHandlers } from "../users";
import { envConfig } from "../config";
import * as uuid from "uuid";

export class AuthHandlers {
  private log;
  private myError;
  private usersHandlers;
  private tokensHandlers;

  constructor(isLog = true) {
    if (isLog) {
      this.log = logger.child({ service: AuthHandlers.name });
    }
    this.myError = new MyError(this.log);
    this.usersHandlers = new UsersHandlers();
    this.tokensHandlers = new TokensHandlers();
  }

  public async activate(
    activationId: string,
    headers: Record<string, string | null>,
    cookie: Cookie<any>,
  ) {
    this.log?.info("activate");

    // TODO
    // const user = await this.usersHandlers.activateUser(activationId)

    // Tokens
    const userAgent = headers["user-agent"] || "";
    if (!userAgent) {
      this.log?.warn("login", "Missing user agent");
    }
    const tokens = await this.tokensHandlers.generateTokens(user, userAgent);

    // Cookie
    const domain = envConfig.get("URL");
    cookie.name = "auth-cookie";
    cookie.value = tokens.refreshToken;
    cookie.set({
      secure: true,
      sameSite: "strict",
      domain: domain,
      httpOnly: true,
    });

    // Zod
    let responseUser;
    try {
      responseUser = UserZod.pick({
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }).parse(user);
    } catch (error) {
      throw this.myError.new("login", 400, error);
    }

    return { user: responseUser, token: tokens.accessToken };
  }

  public async registration(name: string, email: string, password: string) {
    this.log?.info("registration");
    const hashPassword = await Bun.password.hash(password);
    const user = await this.usersHandlers.createUser({
      name,
      email,
      password: hashPassword,
    });
    const activationId = uuid.v4();
    // TODO
    // await this.usersHandlers.saveActivationId({name, email, password:hashPassword})

    const URL = envConfig.get("URL");
    // TODO
    // await this.mailHandlers.sendActivationMail(email, `${URL}/activate/${resetId}`)
    return;
  }

  public async login(
    user: User,
    headers: Record<string, string | null>,
    cookie: Cookie<any>,
  ) {
    this.log?.info("login");
    // Tokens
    const userAgent = headers["user-agent"] || "";
    if (!userAgent) {
      this.log?.warn("login", "Missing user agent");
    }
    const tokens = await this.tokensHandlers.generateTokens(user, userAgent);
    // Cookie
    const domain = envConfig.get("URL");
    cookie.name = "auth-cookie";
    cookie.value = tokens.refreshToken;
    cookie.set({
      secure: true,
      sameSite: "strict",
      domain: domain,
      httpOnly: true,
    });

    // Zod
    let responseUser;
    try {
      responseUser = UserZod.pick({
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }).parse(user);
    } catch (error) {
      throw this.myError.new("login", 400, error);
    }

    return { user: responseUser, token: tokens.accessToken };
  }

  public async refresh(
    user: User,
    headers: Record<string, string | null>,
    cookie: Cookie<any>,
  ) {
    this.log?.info("refresh");
    // Tokens
    const userAgent = headers["user-agent"] || "";
    if (!userAgent) {
      this.log?.warn("refresh", "Missing user agent");
    }
    const tokens = await this.tokensHandlers.updateTokens(user, userAgent);
    // Cookie
    cookie.remove();
    const domain = envConfig.get("URL");
    cookie.name = "auth-cookie";
    cookie.value = tokens.refreshToken;
    cookie.set({
      secure: true,
      sameSite: "strict",
      domain: domain,
      httpOnly: true,
    });

    return { token: tokens.accessToken };
  }

  public async logout(cookie: Cookie<any>) {
    this.log?.info("logout");
    await this.tokensHandlers.deleteRefreshToken(cookie.value);
    cookie.remove();
  }

  public async forgotPassword(email: string) {
    this.log?.info("forgotPassword");
    const user = await this.usersHandlers.getUserByEmail(email);
    if (!user) {
      throw this.myError.new("forgotPassword", 404, "User not found");
    }
    if (!user.isActivated) {
      throw this.myError.new(
        "forgotPassword",
        403,
        "Account in not activated. Please, check your email",
      );
    }
    const resetId = uuid.v4();

    // TODO
    // await this.usersHandler.saveResetPasswordId(resetId);

    const URL = envConfig.get("URL");
    // TODO
    // await this.mailHandlers.sendResetPasswordMail(email, `${URL}/reset/${resetId}`)
  }

  public async resetPassword(resetId: string, newPassword: string) {
    this.log?.info("resetPassword");
    const password = await Bun.password.hash(newPassword);

    // TODO
    // const user = await this.userService.resetPassword(resetId, password);
    if (!user) {
      throw this.myError.new("resetPassword", 404, "User not found");
    }

    return;
  }
}
