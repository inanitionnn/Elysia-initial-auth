import Elysia, { t } from "elysia";
import { UsersHandlers } from "./users.handlers";
import { TokensHandlers } from "../tokens";
import { GuardsHandlers } from "../guards/guards.handler";
import bearer from "@elysiajs/bearer";

const usersHandler = new UsersHandlers();
const guardsHandlers = new GuardsHandlers();

export const UsersRoutes = new Elysia().group("/users", (app) =>
  app
    .use(bearer())
    .get("/", async ({ bearer }) => {
      // Guard use example
      const user = await guardsHandlers.authGuard(bearer);
      await guardsHandlers.roleGuard(user.id, ["moder", "admin"]);
      return await usersHandler.getAllUsers();
    })
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
