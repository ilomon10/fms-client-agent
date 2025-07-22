import { Application, Router } from "../app.ts";
import GPS from "../lib/gps/gps.ts";

const gps = new GPS({ portPath: "/dev/ttyACM0", auto: true });

export default function gpsService(app: Application) {
  const router = new Router();

  router.get("/api/gps", async (ctx) => {
    const state = gps.get();
    ctx.response.body = {
      time: state.time,
      latitude: state.lat,
      longitude: state.lon,
      speed: state.speed,
      track: state.track,
      altitude: state.alt,
      is_fixed: state.fix,
      hdop: state.hdop,
      pdop: state.pdop,
      vdop: state.vdop,
      satellites: state.satsActive,
    };
  });

  router.get("/api/gps/raw", async (ctx) => {
    const state = gps.get();
    ctx.response.body = state;
  });

  app.http_use(router.routes());

  app.io_use((io) => {
    gps.on("data", (data) => {
      console.log(data);
      if (data) {
        io.to("public").emit("/api/gps:get", gps.get());
      }
    });
  });
}
