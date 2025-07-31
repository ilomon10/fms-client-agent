import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import GPS from "../lib/gps/gps.ts";
import os from "node:os";

type GpsConfigType = {
  path: string;
  type: "serialport";
};

export default class GpsFeature extends Feature {
  public name = "gps";
  public status: FeatureStatus;
  public config: GpsConfigType;
  public router = new Router();
  public gps: GPS | null = null;

  constructor() {
    super();
    this.status = "OK";
    this.config = {
      "type": "serialport",
      "path": "COM11",
    };
  }

  register(app: Application) {
    this.config = Object.assign({}, app.get<GpsConfigType>("gps"));

    let gps = this.gps;
    if (os.platform() != "win32") {
      try {
        gps = new GPS({ portPath: this.config.path, auto: true });
      } catch {
        this.status = "FAIL";
      }
    } else {
      this.status = "UNSUPPORTED";
    }

    if (!gps) return;

    this.router.get("/api/gps", (ctx) => {
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

    this.router.get("/api/gps/raw", (ctx) => {
      const state = gps.get();
      ctx.response.body = state;
    });

    app.httpUse(this.router.routes());

    app.ioUse((io) => {
      gps.on("data", (data) => {
        if (data) {
          io.to("public").emit("/api/gps:get", gps.get());
        }
      });
    });
  }
}
