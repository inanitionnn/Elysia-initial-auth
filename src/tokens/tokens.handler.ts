import { envConfig } from "../config";
import db from "../db/drizzle";
import { MyError } from "../error";
import { logger } from "../log";
import { User } from "../users";
import jwt from "jsonwebtoken";
import { TokensTable } from "./token.entity";
import { and, eq, sql } from "drizzle-orm";

export class TokensHandlers {
  private log;
  private myError;
  private readonly JWT_SECRET;
  private readonly ACCESS_JWT_EXPIRE;
  private readonly REFRESH_JWT_EXPIRE;
  private readonly MAX_TOKEN_COUNT_PER_USER;

  constructor(isLog = true) {
    if (isLog) {
      this.log = logger.child({ service: TokensHandlers.name });
    }
    this.myError = new MyError(this.log);

    this.JWT_SECRET = envConfig.get("JWT_SECRET");
    // convert mins to secunds
    this.ACCESS_JWT_EXPIRE =
      Number(envConfig.get("ACCESS_JWT_EXPIRE_MINS")) * 60;
    // convert days to miliseconds
    this.REFRESH_JWT_EXPIRE =
      Number(envConfig.get("REFRESH_JWT_EXPIRE_DAYS")) * 24 * 60 * 60 * 1000;
    this.MAX_TOKEN_COUNT_PER_USER = 3;
  }

  //#region Get
  private async getRefreshTokenUser(refreshToken: string) {
    this.log?.info("getRefreshTokenUser");
    try {
      const tokenUser = (
        await db
          .select()
          .from(TokensTable)
          .where(eq(TokensTable.token, refreshToken))
      )[0];

      return tokenUser;
    } catch (error) {
      throw this.myError.new("getRefreshTokenUser", 500, error);
    }
  }

  //#endregion Get

  //#region Generate
  public async generateTokens(user: User, userAgent: string) {
    this.log?.info("generateTokens");
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id, userAgent);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User): string {
    this.log?.info("generateAccessToken");
    const payload = {
      id: user.id,
      role: user.role,
    };
    const secret = this.JWT_SECRET;
    return jwt.sign(payload, secret, {
      expiresIn: this.ACCESS_JWT_EXPIRE,
    });
  }

  private async generateRefreshToken(
    userId: string,
    userAgent: string,
  ): Promise<string> {
    this.log?.info("generateRefreshToken");
    const uniqueId = String(Bun.hash(userAgent));
    try {
      // Delete not unique token
      await db.delete(TokensTable).where(eq(TokensTable.uniqueId, uniqueId));

      // Get count of refresh tokens
      const { count: tokensCount } = (
        await db
          .select({ count: sql<number>`count(*)` })
          .from(TokensTable)
          .where(eq(TokensTable.userId, userId))
      )[0];

      //  if user has maximum number of tokens -- delete oldest token
      if (tokensCount == this.MAX_TOKEN_COUNT_PER_USER) {
        const { id: oldestTokenId } = (
          await db
            .select({ id: TokensTable.id })
            .from(TokensTable)
            .where(eq(TokensTable.userId, userId))
            .orderBy(TokensTable.createdAt)
        )[0];
        await db.delete(TokensTable).where(eq(TokensTable.id, oldestTokenId));
      }

      //  if user has more than maximum of tokens -- delete all token
      if (tokensCount > this.MAX_TOKEN_COUNT_PER_USER) {
        await db.delete(TokensTable).where(eq(TokensTable.userId, userId));
      }

      // create new refresh token
      const { token: refreshToken } = (
        await db.insert(TokensTable).values({ userId, uniqueId }).returning()
      )[0];

      return refreshToken;
    } catch (error) {
      throw this.myError.new("generateRefreshToken", 500, error);
    }
  }

  //#endregion Generate

  //#region Delete
  public async deleteRefreshToken(refreshToken: string): Promise<void> {
    this.log?.info("deleteRefreshToken");
    try {
      await db.delete(TokensTable).where(eq(TokensTable.token, refreshToken));
    } catch (error) {
      throw this.myError.new("deleteRefreshToken", 500, error);
    }
  }

  //#endregion Create

  //#region Update
  public async updateTokens(user: User, userAgent: string) {
    this.log?.info("updateTokens");
    const uniqueId = String(Bun.hash(userAgent));
    try {
      // delete old token
      await db
        .delete(TokensTable)
        .where(
          and(
            eq(TokensTable.uniqueId, uniqueId),
            eq(TokensTable.userId, user.id),
          ),
        );

      // generate new
      const tokens = await this.generateTokens(user, userAgent);

      return tokens;
    } catch (error) {
      throw this.myError.new("updateTokens", 500, error);
    }
  }

  //#endregion Update

  //#region Validate
  public async validRefreshToken(refreshToken: string) {
    this.log?.info("validRefreshToken");

    const tokenUser = await this.getRefreshTokenUser(refreshToken);

    if (!tokenUser) {
      throw this.myError.new("validRefreshToken", 404, "Token not found");
    }

    const expiresIn = this.REFRESH_JWT_EXPIRE * 1000;
    const now = Date.now();
    const createdAt = tokenUser.createdAt.getTime();
    if (now - createdAt > expiresIn) {
      throw this.myError.new("validRefreshToken", 400, "Token expired");
    }

    return tokenUser;
  }
  //#endregion Validate
}
