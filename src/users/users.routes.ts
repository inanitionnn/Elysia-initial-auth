import Elysia, { t } from "elysia";
import { UsersHandlers } from "./users.handlers";

const usersHandler = new UsersHandlers();

export const UsersRoutes = new Elysia().group("/users", (app) =>
  app
    .get("/", async () => await usersHandler.getAllUsers())
    .get(
      "/:id",
      async ({ params }) => await usersHandler.getUserById(params.id),
    )
    .post("/", async ({ body }) => await usersHandler.createUser(body), {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    })
    .delete(
      "/:id",
      async ({ params }) => await usersHandler.deleteUser(params.id),
    ),
);
