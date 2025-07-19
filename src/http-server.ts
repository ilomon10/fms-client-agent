import { Application, Router } from "oak";

const http_server = new Application();

const router = new Router();

router.get("api/health", (ctx) => {
  ctx.response.body = {
    status: "OK",
    io: {
      gps: "FAILED",
      can: "FAILED",
      gpio: "FAILED",
    },
  };
});

http_server.use(router.routes());
http_server.use(router.allowedMethods());

export default http_server;
