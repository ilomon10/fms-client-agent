import {
  Application as HTTP_Server,
  Context,
  Router as HTTP_Router,
} from "oak";
import { Server as IO_Server } from "socket.io";
import os from "node:os";
import { Feature } from "./feature.ts";
import { Service } from "./service.ts";

export { HTTP_Router as Router };

// Type guards
function isFeature(obj: any): obj is Feature {
  return obj && typeof obj.register === "function" &&
    typeof obj.status !== "undefined";
}

function isService(obj: any): obj is Service {
  return obj && typeof obj.init === "function";
}

export class Application {
  private _http = new HTTP_Server();
  private _router = new HTTP_Router();
  private _io = new IO_Server();
  private _features: Record<string, Feature> = {};
  private _services: Record<string, Service> = {};
  private _settings = new Map<string, unknown>();

  constructor() {
    this.loadConfig();
    this.registerCore();
  }

  /** Register a function, Feature, or Service */
  public configure(
    fn: ((app: Application) => void | Promise<void>) | Feature | Service,
  ) {
    if (typeof fn === "function") {
      const res = fn(this);
      if (res instanceof Promise) res.catch(console.error);
    } else if (isFeature(fn)) {
      this.useFeature(fn);
    } else if (isService(fn)) {
      this.useService(fn);
    }
    return this;
  }

  private useFeature(feature: Feature) {
    this._features[feature.name] = feature;
    if (feature.status === "OK") {
      const res = feature.register(this);
      if (res instanceof Promise) res.catch(console.error);
    }
  }

  private useService(service: Service) {
    this._services[service.name] = service;
    const res = service.init(this);
    if (res instanceof Promise) res.catch(console.error);
  }

  private registerCore() {
    this._router.get("/", (ctx) => (ctx.response.body = "hello world"));
    this._router.get("/health", (ctx) => {
      const features: Record<string, string> = {};
      for (const f of Object.values(this._features)) {
        features[f.name] = f.status;
      }
      ctx.response.body = { platform: os.platform(), features };
    });
    this._http.use(this._router.routes(), this._router.allowedMethods());
  }

  public httpUse(...args: Parameters<HTTP_Server["use"]>) {
    this._http.use(...args);
    return this;
  }

  public ioUse(fn: (io: IO_Server, app: Application) => void) {
    fn(this._io, this);
    return this;
  }

  public middleware(
    fn: (ctx: Context, next: () => Promise<unknown>) => void | Promise<void>,
  ) {
    this._http.use(fn);
    return this;
  }

  public get<T>(key: string): T | undefined {
    return this._settings.get(key) as T;
  }

  public set(key: string, val: unknown) {
    this._settings.set(key, val);
    return this;
  }

  private loadConfig() {
    const raw = Deno.readFileSync("config.json");
    const cfg = JSON.parse(new TextDecoder().decode(raw));
    Object.entries(cfg).forEach(([k, v]) => this.set(k, v));
  }

  public serve(options: { port?: number } = {}) {
    const handler = this._io.handler(async (req) => {
      return (await this._http.handle(req)) ||
        new Response(null, { status: 404 });
    });
    Deno.serve({ handler, port: options.port ?? 3000 });
  }
}
