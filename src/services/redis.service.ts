import { Application } from "../app.ts";
import { Service } from "../service.ts";
import { createClient, RedisClientType } from "redis";

export class RedisService extends Service {
  public name = "redis";
  private client!: RedisClientType;

  async init(app: Application) {
    const redisUrl = app.get<string>("redisUrl")!;
    this.client = createClient({ url: redisUrl });
    await this.client.connect();
    // store client for other services
    app.set("redisClient", this.client);
    // attach middleware to context
    app.middleware(async (ctx, next) => {
      ctx.state.redis = this.client;
      await next();
    });
  }
}
