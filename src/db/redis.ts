import { createClient } from "redis";

export class Redis {
  private client;
  private isConnected: boolean;

  constructor() {
    this.client = createClient();
    this.isConnected = false;
  }

  private async connect() {
    await this.client.connect();
    this.isConnected = true;
  }

  private async disconnect() {
    await this.client.disconnect();
    this.isConnected = false;
  }

  public async cache<T>(
    key: string,
    cacheTimeSeconds: number,
    queryFunction: () => Promise<T>,
  ): Promise<T> {
    if (!this.isConnected) {
      await this.connect();
    }

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
