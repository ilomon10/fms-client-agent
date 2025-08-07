import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import GPS from "../lib/gps/gps.ts";
import os from "node:os";

type GpsConfigType = {
  path: string;
  type: "serialport";
};

const os_platform = os.platform();

export default class GpsFeature extends Feature {
  public name = "gps";
  public status: FeatureStatus;
  public config: GpsConfigType;
  public router = new Router();
  public gps: GPS | null = null;

  constructor(
    public emulateGPS: boolean = false,
  ) {
    super();
    this.status = "OK";
    this.config = {
      "type": "serialport",
      "path": os_platform == "win32" ? "COM11" : "/dev/ttyACM0",
    };
  }

  register(app: Application) {
    this.config = Object.assign({}, app.get<GpsConfigType>(this.name));

    if (this.emulateGPS) {
      this.gps = new GPS({
        portPath: "/dev/null", // dummy since we’re emulating
        emulate: true,
        auto: true,
      });
    } else if (os.platform() != "win32") {
      try {
        this.gps = new GPS({ portPath: this.config.path, auto: true });
      } catch {
        this.status = "FAIL";
      }
    } else {
      this.status = "UNSUPPORTED";
    }

    const gps = this.gps;

    if (!gps) return;

    this.router.get("/api/gps", (ctx) => {
      ctx.response.body = this.get(gps);
    });

    this.router.get("/api/gps/raw", (ctx) => {
      const state = gps.get();
      ctx.response.body = state;
    });

    app.httpUse(this.router.routes());

    app.ioUse((io) => {
      gps.on("data", (data) => {
        if (data) {
          io.to("public").emit("/api/gps:get", this.get(gps));
        }
      });
    });
  }

  public get(gps: GPS) {
    const state = gps.get();
    return {
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
  }
}
