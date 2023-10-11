import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { UsersHandlers } from "./users.handlers";
import { envConfig } from "../config";
import { User } from "./user.entity";

describe("Users", () => {
  const usersHandler = new UsersHandlers(false);
  const url = envConfig.get("URL") + "/users";

  let userMock = {
    name: "ExampleName",
    email: "Example@gmail.com",
    password: "ExamplePassword",
  };

  let user1: User;
  let user2: User;

  beforeEach(async () => {
    const user1Mock = {
      name: "Example1Name",
      email: "Example1@gmail.com",
      password: "Example1Password",
    };
    const user2Mock = {
      name: "Example2Name",
      email: "Example2@gmail.com",
      password: "Example2Password",
    };
    user1Mock.password = await Bun.password.hash(user1Mock.password);
    user2Mock.password = await Bun.password.hash(user2Mock.password);

    user1 = await usersHandler.createUser(user1Mock);
    user2 = await usersHandler.createUser(user2Mock);
  });

  afterEach(async () => {
    await usersHandler.deleteUser(user1.id);
    await usersHandler.deleteUser(user2.id);
  });

  describe("Routes", () => {});

  describe("Handlers", () => {
    describe("getAllUsers", () => {
      it("Success", async () => {
        // QUERY
        const response = await usersHandler.getAllUsers();

        // TEST
        expect(response).toBeArray();
        expect(response.find((user) => user.id === user1.id)?.name).toBe(
          user1.name,
        );
        expect(response.find((user) => user.id === user1.id)?.email).toBe(
          user1.email,
        );
        expect(response.find((user) => user.id === user2.id)?.email).toBe(
          user2.email,
        );
        expect(response.find((user) => user.id === user2.id)?.email).toBe(
          user2.email,
        );
      });
    });

    describe("getUserById", () => {
      it("Success", async () => {
        // QUERY
        const response = await usersHandler.getUserById(user1.id);

        // TEST
        expect(response?.name).toBe(user1.name);
        expect(response?.email).toBe(user1.email);
      });
      it("Error: Bad request (id)", async () => {
        // TEST
        expect(async () => await usersHandler.getUserById("wrong id")).toThrow(
          "id: Invalid uuid",
        );
      });
    });

    describe("getUserByEmail", () => {
      it("Success", async () => {
        // QUERY
        const response = await usersHandler.getUserByEmail(user1.email);

        // TEST
        expect(response?.name).toBe(user1.name);
        expect(response?.email).toBe(user1.email);
      });
      it("Error: Bad request (email)", async () => {
        // TEST
        expect(
          async () => await usersHandler.getUserByEmail("wrongEmail"),
        ).toThrow("Invalid email");
      });
    });

    describe("createUser", () => {
      it("Success", async () => {
        // QUERY
        userMock.password = await Bun.password.hash(userMock.password);
        const response = await usersHandler.createUser(userMock);

        // TEST
        expect(response.name).toBe(userMock.name);
        expect(response.email).toBe(userMock.email);

        // Clear
        await usersHandler.deleteUser(response.id);
      });
      it("Error: Bad request (password)", async () => {
        // Mock
        userMock.password = "BadPassword";

        // TEST
        expect(async () => await usersHandler.createUser(userMock)).toThrow(
          "password",
        );
      });
      it("Error: Bad request (email)", async () => {
        // MOCK
        userMock.email = "BadEmail";

        // TEST
        expect(async () => await usersHandler.createUser(userMock)).toThrow(
          "Invalid email",
        );
      });
    });

    describe("deleteUser", () => {
      it("Success", async () => {
        // QUERY
        const response = await usersHandler.deleteUser(user1.id);

        // TEST
        expect(response?.name).toBe(user1.name);
        expect(response?.email).toBe(user1.email);
      });
      it("Error: Bad request (id)", async () => {
        // TEST
        expect(async () => await usersHandler.deleteUser("wrondId")).toThrow(
          "id: Invalid uuid",
        );
      });
    });

    // TODO
    // describe("addRoleToUser", () => {
    //   it("Success", async () => {
    //     // QUERY
    //     const response = await usersHandler.addRoleToUser();

    //     // TEST
    //     expect(response).toBeArray();
    //     expect(response.find((user) => user.id === user1.id)?.name).toBe(
    //       user1.name,
    //     );
    //     expect(response.find((user) => user.id === user1.id)?.email).toBe(
    //       user1.email,
    //     );
    //     expect(response.find((user) => user.id === user2.id)?.email).toBe(
    //       user2.email,
    //     );
    //     expect(response.find((user) => user.id === user2.id)?.email).toBe(
    //       user2.email,
    //     );
    //   });
    // });
  });
});
