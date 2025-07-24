import { platform } from "node:os";
import { Application as HTTP_Server, Router as HTTP_Router } from "oak";
import { Server as IO_Server } from "socket.io";
import os from "node:os";

export { HTTP_Router as Router };

export class Application {
  private _http_server: HTTP_Server;
  private _http_router: HTTP_Router;
  private _io_server: IO_Server;

  private _settings = Object.create({});

  constructor() {
    this._http_server = new HTTP_Server();
    this._http_router = new HTTP_Router();
    this._io_server = new IO_Server();
    this.setup();
  }

  setup() {
    this._open_config_file();

    this._http_router.get("/", (ctx) => {
      ctx.response.body = "hello world";
    });

    this._http_router.get("/health", (ctx) => {
      ctx.response.body = {
        platform: os.platform(),
        features: {
          gps: "OK",
          gpio: "FAIL",
          can: "UNSUPPORTED",
        },
      };
    });

    this._http_server.use(this._http_router.routes());
    this._http_server.use(this._http_router.allowedMethods());

    this._io_server.on("connection", (socket) => {
      console.log(`socket ${socket.id} connected`);

      socket.on("authentication", (_socketId, { type }) => {
        if (type === "private") {
          socket.join("private");
        } else {
          socket.join("public");
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
      });
    });
  }

  public get<T = unknown>(name: string) {
    return this._settings[name] as T;
  }
  public set(name: string, value: unknown) {
    return (this._settings[name] = value);
  }

  private _open_config_file() {
    const decoder = new TextDecoder("utf-8");
    const configFileBuf = Deno.readFileSync("config.json");
    const config = JSON.parse(decoder.decode(configFileBuf));

    for (const [key, value] of Object.entries(config)) {
      this.set(key, value);
    }
    console.log(this._settings);
  }

  http_use(...args: Parameters<HTTP_Server["use"]>) {
    return this._http_server.use(...args);
  }

  io_use(callback: (io_server: IO_Server, app: Application) => void) {
    return callback(this._io_server, this);
  }

  configure(callback: (app: Application) => void) {
    callback(this);
  }

  serve(options?: { port?: number }) {
    const handler = this._io_server.handler(async (req) => {
      return (
        (await this._http_server.handle(req)) ||
        new Response(null, { status: 404 })
      );
    });
    const { port } = options || {};
    Deno.serve({
      handler,
      port: port || 3000,
    });
  }
}
