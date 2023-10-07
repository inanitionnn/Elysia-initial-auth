import { Elysia } from "elysia";
import { UsersRoutes } from "./users";
import { logger } from "./log";
import { envConfig } from "./config";
import { Redis } from "./db";

const PORT = Number(envConfig.get("PORT"));
export const app = new Elysia()
  .group("/api", (app) => app.use(UsersRoutes))
  .listen(PORT);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
