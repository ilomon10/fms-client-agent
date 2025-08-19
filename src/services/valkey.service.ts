import { Application } from "../app.ts";
import { Service } from "../service.ts";
import { GlideClient } from "npm:@valkey/valkey-glide";

export type RedisConfig = {
  url: string;
};

export class RedisService extends Service {
  public name = "redis";
  public client: GlideClient;

  constructor() {
    super();
  }

  async init(app: Application) {
    const client = await GlideClient.createClient({
      addresses: [{ host: "localhost", port: 6379 }],
    });
    this.client = client;
    // const config = app.get<RedisConfig>("redis")!;
    // await this.client.connect();
    // store client for other services
    app.set("glideClient", this.client);
    // attach middleware to context
    app.middleware(async (ctx, next) => {
      ctx.state.redis = this.client;
      await next();
    });
  }

  async set<T extends RedisJSON>(key: string, path: RedisArgument, value: T) {
    return await this.client.json.set(key, path, value);
  }

  hashSet(key: string, value: any) {
    return this.client;
  }

  async get<T extends RedisJSON>(key: string, path?: RedisArgument) {
    return await (<T>this.client.json.get(key, path));
  }
  async hSet<T extends Record<string, any>>(key: string, value: T) {
    return await this.client.hSet(key, value);
  }

  async hGetAll<T extends Record<string, any>>(key: string) {
    return await (<T>this.client.hGetAll(key));
  }
}
