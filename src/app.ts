import { Application as HTTP_Server, Router as HTTP_Router } from "oak";
import { Server as IO_Server } from "socket.io";

export { HTTP_Router as Router };

export class Application {
  private _http_server: HTTP_Server;
  private _http_router: HTTP_Router;
  private _io_server: IO_Server;

  constructor() {
    this._http_server = new HTTP_Server();
    this._http_router = new HTTP_Router();
    this._io_server = new IO_Server();
    this.setup();
  }

  setup() {
    this._http_router.get("/", (ctx) => {
      ctx.response.body = "hello world";
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

  http_use(...args: Parameters<HTTP_Server["use"]>) {
    return this._http_server.use(...args);
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
