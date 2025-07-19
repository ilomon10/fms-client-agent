import { Application, Router } from "oak";
import GPS from "./lib/gps/gps.ts";

const http_server = new Application();

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "hello world";
});

router.get("/api/health", (ctx) => {
  ctx.response.body = {
    status: "OK",
    io: {
      gps: "FAILED",
      can: "FAILED",
      gpio: "FAILED",
    },
  };
});

const gps = new GPS({
  auto: true,
});

router.get("/api/gps", async (ctx) => {
  const list_usb = await gps.list();
  console.log(list_usb);
  ctx.response.body = {
    list_usb,
  };
});

router.get("/api/gps/list", async (ctx) => {
  const list_usb = await gps.list();
  console.log(list_usb);
  ctx.response.body = {
    list_usb,
  };
});

http_server.use(router.routes());
http_server.use(router.allowedMethods());

export default http_server;
