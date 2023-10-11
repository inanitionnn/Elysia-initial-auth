import { Elysia } from "elysia";
import { UsersRoutes } from "./users";
import { logger } from "./log";
import { envConfig } from "./config";
import cors from "@elysiajs/cors";
import { AuthRoutes } from "./auth/auth.routes";

const PORT = Number(envConfig.get("PORT"));
export const app = new Elysia()
  .use(
    cors({
      // origin: /\*.saltyaom.com$/
    }),
  )
  .group("/api", (app) => app.use(UsersRoutes).use(AuthRoutes))
  .listen(PORT);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
