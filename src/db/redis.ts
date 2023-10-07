import { RedisClientType } from "@redis/client";
import { createClient } from "redis";

export class Redis {
  public client: RedisClientType;

  constructor() {
    this.client = createClient();
    this.client.on("error", (err) => console.log("Redis Client Error", err));
  }

  public async cache<T>(
    key: string,
    cacheTimeSeconds: number,
    queryFunction: () => Promise<T>,
  ): Promise<T> {
    // Check old cache
    const redisResult = await this.client.get(key);
    if (redisResult) {
      await this.client.expire(key, cacheTimeSeconds, "XX");
      return JSON.parse(redisResult);
    }

    // Query
    const result = await queryFunction();

    // Renew cache
    await this.client.setEx(key, cacheTimeSeconds, JSON.stringify(result));

    return result;
  }
}
