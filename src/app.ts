import os from "node:os";
import {
  Application as HTTP_Server,
  Context,
  Router as HTTP_Router,
} from "oak";
import { Server as IO_Server } from "socket.io";
import { Feature } from "./feature.ts";
import { Service } from "./service.ts";
import { Handler } from "./handler.ts";
import { DefaultEvents, Emitter } from "nanoevents";
import { EventEmitter } from "./lib/event-emitter/event-emitter.ts";
import { EventListener } from "./listener.ts";

export { HTTP_Router as Router };

function isFeature(obj: unknown): obj is Feature {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "register" in obj &&
    typeof (obj as Feature).register === "function" &&
    "status" in obj &&
    typeof (obj as Feature).status !== "undefined"
  );
}

function isService(obj: unknown): obj is Service {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "init" in obj &&
    typeof (obj as Service).init === "function"
  );
}

function isHandler(obj: unknown): obj is Handler {
  return obj instanceof Handler;
}

function isListener(obj: unknown): obj is EventListener {
  return obj instanceof EventListener;
}

export class Application {
  private _http = new HTTP_Server();
  private _router = new HTTP_Router();
  private _io = new IO_Server({
    cors: {
      // origin: "http://localhost:5173"
      origin: /^http:\/\/localhost:\d+$/,
    },
  });
  private _features: Record<string, Feature> = {};
  private _services: Record<string, Service> = {};
  private _handlers: Record<string, Handler> = {};
  private _settings = new Map<string, unknown>();
  private _listeners: Record<string, EventListener> = {};
  public emitter: Emitter<DefaultEvents>;

  constructor() {
    this.loadConfig();
    this.registerCore();
    this.emitter = new EventEmitter().emitter;
  }

  public configure(
    fn:
      | ((app: Application) => void | Promise<void>)
      | Feature
      | Service
      | Handler
      | EventListener,
  ) {
    if (typeof fn === "function") {
      const res = fn(this);
      if (res instanceof Promise) res.catch(console.error);
    } else if (isFeature(fn)) {
      this.useFeature(fn);
    } else if (isService(fn)) {
      this.useService(fn);
    } else if (isHandler(fn)) {
      this.useHandler(fn);
    } else if (isListener(fn)) {
      this.useListener(fn);
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

  private useHandler(handler: Handler) {
    this._handlers[handler.name] = handler;
    const res = handler.register(this);
    if (res instanceof Promise) res.catch(console.error);
  }

  private useListener(listener: EventListener) {
    this._listeners[listener.name] = listener;
    const res = listener.init(this);
    if (res instanceof Promise) res.catch(console.error);
  }

  private registerCore() {
    this._router.get("/", (ctx) => (ctx.response.body = "hello world"));
    this._router.get("/api/health", (ctx) => {
      const features: Record<string, string> = {};
      for (const f of Object.values(this._features)) {
        features[f.name] = f.status;
      }
      ctx.response.body = {
        uptime: Deno.osUptime(),
        platform: os.platform(),
        features,
      };
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

  public feature(name: string) {
    return this._features[name];
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
      return (
        (await this._http.handle(req)) || new Response(null, { status: 404 })
      );
    });
    Deno.serve({ handler, port: options.port ?? 3000 });
  }
}
