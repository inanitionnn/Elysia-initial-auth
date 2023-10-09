import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { TokensHandlers } from "./tokens.handler";
import { User, UsersHandlers } from "../users";
import jwt from "jsonwebtoken";
import { envConfig } from "../config";

describe("Tokens", () => {
  const JWT_SECRET = envConfig.get("JWT_SECRET");

  const tokensHandlers = new TokensHandlers(false);
  const usersHandler = new UsersHandlers(false);

  let userMock;
  let user: User;
  beforeEach(async () => {
    userMock = {
      name: "ExampleName",
      email: "Example1@gmail.com",
      password: "ExamplePassword",
    };

    userMock.password = await Bun.password.hash(userMock.password);
    user = await usersHandler.createUser(userMock);
  });

  afterEach(async () => {
    await usersHandler.deleteUser(user.id);
  });

  describe("Handlers", () => {
    describe("generateTokens", () => {
      it("Success", async () => {
        // QUERY
        const { accessToken, refreshToken } =
          await tokensHandlers.generateTokens(user, "some User Agent");

        // TEST
        expect(accessToken).toBeString();
        expect(refreshToken).toBeString();
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        expect(decoded).not.toBeString();
        if (typeof decoded !== "string") {
          expect(decoded.role).toBe(user.role);
          expect(decoded.id).toBe(user.id);
        }
      });
    });
    describe("validRefreshToken", () => {
      it("Success", async () => {
        // MOCK
        const { refreshToken } = await tokensHandlers.generateTokens(
          user,
          "some User Agent",
        );

        // QUERY
        const tokenUser = await tokensHandlers.validRefreshToken(refreshToken);

        // TEST
        expect(tokenUser.userId).toBe(user.id);
      });
      it("Error: Not found (token)", async () => {
        // MOCK
        const { refreshToken } = await tokensHandlers.generateTokens(
          user,
          "some User Agent",
        );
        await tokensHandlers.deleteRefreshToken(refreshToken);

        // TEST
        expect(
          async () => await tokensHandlers.validRefreshToken(refreshToken),
        ).toThrow("Token not found");
      });
    });
    describe("deleteRefreshToken", () => {
      it("Success", async () => {
        // MOCK
        const { refreshToken } = await tokensHandlers.generateTokens(
          user,
          "some User Agent",
        );

        // QUERY
        await tokensHandlers.deleteRefreshToken(refreshToken);

        // TEST
        expect(
          async () => await tokensHandlers.validRefreshToken(refreshToken),
        ).toThrow("Token not found");
      });
    });
    describe("updateTokens", () => {
      it("Success", async () => {
        // MOCK
        await tokensHandlers.generateTokens(user, "some User Agent");

        // QUERY
        const { accessToken, refreshToken } = await tokensHandlers.updateTokens(
          user,
          "some User Agent",
        );

        // TEST
        expect(accessToken).toBeString();
        expect(refreshToken).toBeString();
      });
      it("Success", async () => {
        // QUERY
        const { accessToken, refreshToken } = await tokensHandlers.updateTokens(
          user,
          "some User Agent",
        );

        // TEST
        expect(accessToken).toBeString();
        expect(refreshToken).toBeString();
      });
    });
  });
});
