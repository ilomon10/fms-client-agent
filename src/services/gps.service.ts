import { Application, Router } from "../app.ts";
import GPS from "../lib/gps/gps.ts";

type GPS_CONFIG = {
  path: string;
  type: "serialport";
};

export default function gpsService(app: Application) {
  const gpsConfig = app.get<GPS_CONFIG>("gps");
  const gps = new GPS({ portPath: gpsConfig.path, auto: true });

  const router = new Router();

  router.get("/api/gps", (ctx) => {
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

  router.get("/api/gps/raw", (ctx) => {
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
