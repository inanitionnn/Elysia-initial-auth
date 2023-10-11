import Elysia, { t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { envConfig } from "../config";
import { MyError } from "../error";
import { AuthHandlers } from "./authHandlers";
import { GuardsHandlers } from "../guards/guards.handler";

const myError = new MyError();
const authHandlers = new AuthHandlers();
const guardsHandlers = new GuardsHandlers();
export const AuthRoutes = new Elysia().post(
  "/login",
  async ({ body, headers, cookie: { name } }) => {
    const user = await guardsHandlers.localGuard(body.email, body.password);
    const response = await authHandlers.refresh(user, headers, name);
    return response;
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  },
);
