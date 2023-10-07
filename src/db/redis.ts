import { createClient } from "redis";

export class Redis {
  private client;

  constructor() {
    this.client = createClient();
  }

  private async connect() {
    await this.client.connect();
  }

  private async disconnect() {
    await this.client.disconnect();
  }

  public async cache<T>(
    key: string,
    cacheTimeSeconds: number,
    queryFunction: () => Promise<T>,
  ): Promise<T> {
    await this.connect();

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

    await this.disconnect();

    return result;
  }
}
