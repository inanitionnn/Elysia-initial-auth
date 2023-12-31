import type { Config } from "drizzle-kit";
import { envConfig } from "./src/config";

export default {
  schema: ["./src/users/user.entity.ts", "./src/tokens/token.entity.ts"],
  driver: "pg",
  dbCredentials: {
    connectionString: envConfig.get("DB_URL"),
  },
  out: "./drizzle",
} satisfies Config;
