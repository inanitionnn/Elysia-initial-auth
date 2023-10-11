import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { TokensHandlers } from "./tokens.handler";
import { UsersHandlers } from "../users";
import jwt from "jsonwebtoken";
import { envConfig } from "../config";
import { User } from "../users/user.entity";

const JWT_SECRET = envConfig.get("JWT_SECRET");

const tokensHandlers = new TokensHandlers(false);
const usersHandler = new UsersHandlers(false);

let userMock;
let user: User;
beforeEach(async () => {
  userMock = {
    name: "ExampleName",
    email: "Example@gmail.com",
    password: "ExamplePassword",
  };

  userMock.password = await Bun.password.hash(userMock.password);
  user = await usersHandler.createUser(userMock);
});

afterEach(async () => {
  await usersHandler.deleteUser(user.id);
});

describe("Tokens", () => {
  describe("Handlers", () => {
    describe("generateTokens", () => {
      test("Success", async () => {
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
      test("Success", async () => {
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
      test("Error: Not found (token)", async () => {
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
      test("Error: Bad request (token)", async () => {
        // TEST
        expect(
          async () => await tokensHandlers.validRefreshToken("Bad token"),
        ).toThrow("token: Invalid uuid");
      });
    });
    describe("deleteRefreshToken", () => {
      test("Success", async () => {
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
      test("Error: Bad request (token)", async () => {
        // TEST
        expect(
          async () => await tokensHandlers.deleteRefreshToken("Bad token"),
        ).toThrow("token: Invalid uuid");
      });
    });
    describe("updateTokens", () => {
      test("Success", async () => {
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
      test("Success", async () => {
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
