import { Cookie } from "elysia";
import { Redis } from "../db";
import { MyError } from "../error";
import { logger } from "../log";
import { TokensHandlers } from "../tokens";
import { User, UserZod, UsersHandlers } from "../users";
import { envConfig } from "../config";

export class AuthHandlers {
  private log;
  private myError;
  private redis;
  private usersHandler;
  private tokensHandlers;

  constructor(isLog = true) {
    if (isLog) {
      this.log = logger.child({ service: AuthHandlers.name });
    }
    this.myError = new MyError(this.log);
    this.redis = new Redis();
    this.usersHandler = new UsersHandlers();
    this.tokensHandlers = new TokensHandlers();
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
    cookie.remove()
    const domain = envConfig.get("URL")
    cookie.name = "auth-cookie";
    cookie.value = tokens.refreshToken;
    cookie.set({
      secure: true,
      sameSite: 'strict',
      domain: domain,
      httpOnly: true
    });

    return { token: tokens.accessToken };
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
    const domain = envConfig.get("URL")
    cookie.name = "auth-cookie";
    cookie.value = tokens.refreshToken;
    cookie.set({
      secure: true,
      sameSite: 'strict',
      domain: domain,
      httpOnly: true
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
    cookie.remove()
    const domain = envConfig.get("URL")
    cookie.name = "auth-cookie";
    cookie.value = tokens.refreshToken;
    cookie.set({
      secure: true,
      sameSite: 'strict',
      domain: domain,
      httpOnly: true
    });

    return { token: tokens.accessToken };
  }

  public async logout(
    cookie: Cookie<any>,
  ) {
    this.log?.info("logout");
 await this.tokensHandlers.deleteRefreshToken(cookie.value);
    cookie.remove()
  }
}
