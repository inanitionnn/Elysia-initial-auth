import type { Config } from "drizzle-kit";
import { Config as EnvConfig } from "./src/config";

const config = new EnvConfig();

export default {
  schema: ["./src/users/users.entity.ts"],
  driver: "pg",
  dbCredentials: {
    connectionString: config.get("DB_URL"),
  },
  out: "./drizzle",
} satisfies Config;
