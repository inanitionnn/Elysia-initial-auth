type envType = "URL" | "DB_URL" | "PORT";

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
