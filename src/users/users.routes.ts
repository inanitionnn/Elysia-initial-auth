import Elysia, { t } from "elysia";
import { UsersHandler } from "./users.handler";

const usersHandler = new UsersHandler();

export const UsersRoutes = new Elysia().group("/users", (app) =>
  app
    .get("/", () => usersHandler.getAllUsers())
    .get("/:id", ({ params }) => usersHandler.getUserById(params))
    .post("/", ({ body }) => usersHandler.createUser(body), {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    })
    .delete("/:id", ({ params }) => usersHandler.deleteUser(params)),
);
