import { describe, expect, it } from "bun:test";
import { UsersRoutes } from "./users.routes";
import { UsersHandler } from "./users.handler";
import { envConfig } from "../config";

describe("Users Handler", () => {
  const usersHandler = new UsersHandler(false);
  const url = envConfig.get("URL") + "/users";

  describe("getAllUsers", () => {
    it("Success", async () => {
      // MOCK
      const user1Mock = {
        name: "ExampleName",
        email: "Example1@gmail.com",
        password: "ExamplePassword",
      };
      const user2Mock = {
        name: "ExampleName",
        email: "Example2@gmail.com",
        password: "ExamplePassword",
      };
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

  describe("createUser", () => {
    it("Success", async () => {
      // MOCK
      const requestMock = {
        name: "ExampleName",
        email: "Example2@gmail.com",
        password: "ExamplePassword",
      };

      // QUERY
      const response = await usersHandler.createUser(requestMock);

      // TEST
      expect(response.name).toBe(requestMock.name);
      expect(response.email).toBe(requestMock.email);

      // CLEAR
      await usersHandler.deleteUser(response);
    });
    it("Error: Bad request (password)", async () => {
      // MOCK
      const requestMock = {
        name: "ExampleName",
        email: "Example2@gmail.com",
        password: "NotHashedPassword",
      };

      // TEST
      expect(async () => await usersHandler.createUser(requestMock)).toThrow(
        "Bad request error!",
      );
    });
    it("Error: Bad request (email)", async () => {
      // MOCK
      let requestMock = {
        name: "ExampleName",
        email: "BadEmail",
        password: "ExamplePassword",
      };

      requestMock.password = await Bun.password.hash(requestMock.password);

      // TEST
      expect(async () => await usersHandler.createUser(requestMock)).toThrow(
        "Bad request error!",
      );
    });
  });

  describe("DELETE /api/users/ (Delete user by id)", () => {
    it("Should return user", async () => {
      // MOCK
      const userMock = {
        name: "ExampleName",
        email: "Example2@gmail.com",
        password: "ExamplePassword",
      };
      const user = await usersHandler.createUser(userMock);

      // QUERY
      const response = await UsersRoutes.handle(
        new Request(url + "/" + user.id, {
          method: "DELETE",
        }),
      ).then((res) => res.json());

      // TEST
      expect(response.name).toBe(userMock.name);
      expect(response.email).toBe(userMock.email);
    });
  });
});
