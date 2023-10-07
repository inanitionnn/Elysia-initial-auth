// import { beforeAll, describe, expect, it } from "bun:test";
// import { UsersRoutes } from "./users.routes";
// import { UsersHandler } from "./users.handler";

// describe("Users Routes", () => {
//   let usersHandler: UsersHandler;
//   const url = process.env.URL + "/users";
//   beforeAll(() => {
//     usersHandler = new UsersHandler();
//   });

//   describe("GET /api/users/ (Get all users)", () => {
//     it("Should return array of users", async () => {
//       // MOCK
//       const user1Mock = {
//         name: "sasha1",
//         email: "sasha2@gmail.com",
//         password: "sasha",
//       };
//       const user2Mock = {
//         name: "sasha1",
//         email: "sasha2@gmail.com",
//         password: "sasha",
//       };
//       const user1 = await usersHandler.createUser(user1Mock);
//       const user2 = await usersHandler.createUser(user2Mock);

//       // QUERY
//       const response = await UsersRoutes.handle(
//         new Request(url + "/", {
//           method: "GET",
//         }),
//       ).then((res) => res.json());

//       // TEST
//       // @ts-ignore
//       expect(response).toBeArray();
//       // @ts-ignore
//       expect(response.find((user) => user.id === user1.id).name).toBe(
//         user1Mock.name,
//       );
//       // @ts-ignore
//       expect(response.find((user) => user.id === user1.id).email).toBe(
//         user1Mock.email,
//       );
//       // @ts-ignore
//       expect(response.find((user) => user.id === user2.id).email).toBe(
//         user2Mock.email,
//       );
//       // @ts-ignore
//       expect(response.find((user) => user.id === user2.id).email).toBe(
//         user2Mock.email,
//       );

//       // CLEAR
//       await usersHandler.deleteUser(user1);
//       await usersHandler.deleteUser(user2);
//     });
//   });

//   describe("POST /api/users/ (Create user)", () => {
//     const createUserQuery = async (body: any) => {
//       return await UsersRoutes.handle(
//         new Request(url + "/", {
//           method: "POST",
//           body: JSON.stringify(body),
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }),
//       ).then((res) => res.json());
//     };

//     it("Should return user", async () => {
//       // MOCK
//       const requestMock = {
//         name: "sasha",
//         email: "sasha@gmail.com",
//         password: "sasha",
//       };

//       // QUERY
//       const response = await createUserQuery(requestMock);

//       // TEST
//       // @ts-ignore
//       expect(response.name).toBe(requestMock.name);
//       // @ts-ignore
//       expect(response.email).toBe(requestMock.email);
//       // @ts-ignore

//       // CLEAR
//       await usersHandler.deleteUser(response);
//     });
//     it("Should return error", async () => {
//       // MOCK
//       const requestMock = {
//         name: "sasha",
//         email: "sasha",
//         password: "sasha",
//       };

//       // TEST
//       expect(async () => await createUserQuery(requestMock)).toThrow();
//     });
//   });

//   describe("DELETE /api/users/ (Delete user by id)", () => {
//     it("Should return user", async () => {
//       // MOCK
//       const userMock = {
//         name: "sasha",
//         email: "sasha@gmail.com",
//         password: "sasha",
//       };
//       const user = await usersHandler.createUser(userMock);

//       // QUERY
//       const response = await UsersRoutes.handle(
//         new Request(url + "/" + user.id, {
//           method: "DELETE",
//         }),
//       ).then((res) => res.json());

//       // TEST
//       // @ts-ignore
//       expect(response.name).toBe(userMock.name);
//       // @ts-ignore
//       expect(response.email).toBe(userMock.email);
//       // @ts-ignore
//     });
//   });
// });
