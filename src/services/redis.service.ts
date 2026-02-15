import { Application } from "../app.ts";
import { Service } from "../service.ts";
import { createClient, RedisArgument, RedisClientType, RedisJSON } from "redis";

export type RedisConfig = {
  url: string;
};

export class RedisService extends Service {
  public name = "redis";
  public client: RedisClientType;

  constructor() {
    super();
    this.client = createClient({
      modules: {},
    });
  }

  init(app: Application) {
    // const config = app.get<RedisConfig>("redis")!;
    // await this.client.connect();
    // store client for other services
    app.set("redisClient", this.client);
    // attach middleware to context
    app.middleware(async (ctx, next) => {
      ctx.state.redis = this.client;
      await next();
    });
  }

  async register() {
    await this.connect();
  }

  connect() {
    return this.client.connect();
  }

  async set<T extends RedisJSON>(key: string, path: RedisArgument, value: T) {
    return await this.client.json.set(key, path, value);
  }
}
