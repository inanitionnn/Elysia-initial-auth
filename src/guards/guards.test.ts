// import { describe, expect, it, beforeEach } from "bun:test";
// import { UsersHandler } from "../users";
// import { Guards } from "./guards.handler";

// describe("Guards", () => {
//   const usersHandler = new UsersHandler(false);
//   const guards = new Guards();
//   let user1Mock = {
//     name: "ExampleName",
//     email: "Example1@gmail.com",
//     password: "ExamplePassword",
//   };
//   beforeEach(async () => {
//     user1Mock = {
//       name: "ExampleName",
//       email: "Example1@gmail.com",
//       password: "ExamplePassword",
//     };
//     user1Mock.password = await Bun.password.hash(user1Mock.password);
//   });

//   describe("roleGuard", () => {
//     it("Success", async () => {
//       // MOCK
//       const user1 = await usersHandler.createUser(user1Mock);
//       await usersHandler.addRoleToUser({ id: user1.id, role: "moder" });
//       // QUERY

//       // TEST
//       expect(
//         await guards.roleGuard(user1.id, ["moder", "admin"]),
//       ).not.toThrow();

//       // CLEAR
//       await usersHandler.deleteUser(user1);
//     });
//     it("Error: Forbidden", async () => {
//       // MOCK
//       const user1 = await usersHandler.createUser(user1Mock);
//       // QUERY

//       // TEST
//       expect(await guards.roleGuard(user1.id, ["moder", "admin"])).toThrow(
//         "You do not have access!",
//       );

//       // CLEAR
//       await usersHandler.deleteUser(user1);
//     });
//   });
// });
