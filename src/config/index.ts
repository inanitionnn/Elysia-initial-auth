type envType =
  | "URL"
  | "DB_URL"
  | "PORT"
  | "JWT_SECRET"
  | "REFRESH_JWT_EXPIRE_DAYS"
  | "ACCESS_JWT_EXPIRE_MINS"
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_PASSWORD";

class Config {
  public get(name: envType) {
    const env = process.env[name];
    if (!env) {
      throw new Error(`Config error. Can't get ${name}.`);
    }
    return env;
  }
}

export const envConfig = new Config();
