import { describe, expect, it, beforeEach } from "bun:test";
import { UsersRoutes } from "./users.routes";
import { UsersHandler } from "./users.handler";
import { envConfig } from "../config";

describe("Users Handler", () => {
  const usersHandler = new UsersHandler(false);
  const url = envConfig.get("URL") + "/users";

  let user1Mock = {
    name: "ExampleName",
    email: "Example1@gmail.com",
    password: "ExamplePassword",
  };
  let user2Mock = {
    name: "ExampleName",
    email: "Example2@gmail.com",
    password: "ExamplePassword",
  };

  beforeEach(async () => {
    user1Mock = {
      name: "ExampleName",
      email: "Example1@gmail.com",
      password: "ExamplePassword",
    };
    user2Mock = {
      name: "ExampleName",
      email: "Example2@gmail.com",
      password: "ExamplePassword",
    };
    user1Mock.password = await Bun.password.hash(user1Mock.password);
    user2Mock.password = await Bun.password.hash(user2Mock.password);
  });

  describe("getAllUsers", () => {
    it("Success", async () => {
      // MOCK
      const user1 = await usersHandler.createUser(user1Mock);
      const user2 = await usersHandler.createUser(user2Mock);

      // QUERY
      const response = await usersHandler.getAllUsers();

      // TEST
      expect(response).toBeArray();
      expect(response.find((user) => user.id === user1.id)?.name).toBe(
        user1Mock.name,
      );
      expect(response.find((user) => user.id === user1.id)?.email).toBe(
        user1Mock.email,
      );
      expect(response.find((user) => user.id === user2.id)?.email).toBe(
        user2Mock.email,
      );
      expect(response.find((user) => user.id === user2.id)?.email).toBe(
        user2Mock.email,
      );

      // CLEAR
      await usersHandler.deleteUser(user1);
      await usersHandler.deleteUser(user2);
    });
  });

  describe("getUserById", () => {
    it("Success", async () => {
      // MOCK
      const user1 = await usersHandler.createUser(user1Mock);

      // QUERY
      const response = await usersHandler.getUserById({ id: user1.id });

      // TEST
      expect(response.name).toBe(user1Mock.name);
      expect(response.email).toBe(user1Mock.email);

      // CLEAR
      await usersHandler.deleteUser(user1);
    });
    it("Error: Bad request (id)", async () => {
      // TEST
      expect(
        async () => await usersHandler.getUserById({ id: "wrondId" }),
      ).toThrow("id: Invalid uuid.");
    });
  });

  describe("createUser", () => {
    it("Success", async () => {
      // QUERY
      const response = await usersHandler.createUser(user1Mock);

      // TEST
      expect(response.name).toBe(user1Mock.name);
      expect(response.email).toBe(user1Mock.email);

      // CLEAR
      await usersHandler.deleteUser(response);
    });
    it("Error: Bad request (password)", async () => {
      // Mock
      user1Mock.password = "BadPassword";

      // TEST
      expect(async () => await usersHandler.createUser(user1Mock)).toThrow(
        "password",
      );
    });
    it("Error: Bad request (email)", async () => {
      // MOCK
      user1Mock.email = "BadEmail";

      // TEST
      expect(async () => await usersHandler.createUser(user1Mock)).toThrow(
        "Invalid email",
      );
    });
  });

  describe("deleteUser", () => {
    it("Success", async () => {
      // MOCK
      const user = await usersHandler.createUser(user1Mock);

      // QUERY
      const response = await usersHandler.deleteUser({ id: user.id });

      // TEST
      expect(response.name).toBe(user.name);
      expect(response.email).toBe(user.email);
    });
    it("Error: Bad request (id)", async () => {
      // TEST
      expect(
        async () => await usersHandler.deleteUser({ id: "wrondId" }),
      ).toThrow("id: Invalid uuid.");
    });
  });
});
