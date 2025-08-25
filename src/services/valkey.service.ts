import { Application } from "../app.ts";
import { Service } from "../service.ts";
import { GlideClient, GlideString } from "npm:@valkey/valkey-glide";

export type RedisConfig = {
  url: string;
};

export class ValkeyService extends Service {
  public name = "redis";
  public client: GlideClient;

  constructor() {
    super();
  }

  async init(app: Application) {
    // const config = app.get<RedisConfig>("redis")!;
    // await this.client.connect();
    // store client for other services
    const client = await GlideClient.createClient({
      addresses: [{ host: "localhost", port: 6379 }],
    });

    // client.
    this.client = client;
    app.set("glideClient", this.client);
    // attach middleware to context
    app.middleware(async (ctx, next) => {
      ctx.state.redis = this.client;
      await next();
    });
  }

  async set(key: string, value: GlideString) {
    return await this.client.set(key, value);
  }

  get(key: string) {
    return this.client.get(key);
  }
}
