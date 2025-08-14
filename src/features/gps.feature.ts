import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import GPS from "../lib/gps/gps.ts";
import os from "node:os";
import type NetworkFeature from "./network.feature.ts";

type GpsConfigType = {
  path: string;
  type: "serialport" | "gpspipe";
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
        this.gps = new GPS({
          portPath: this.config.path,
          source: this.config.type,
          auto: true,
        });
        console.log("GPS: OK");
      } catch (err) {
        this.status = "FAIL";
        console.log("GPS: FAIL", err);
      }
    } else {
      this.status = "UNSUPPORTED";
      console.log("GPS: UNSUPPORTED");
    }

    const gps = this.gps;

    if (!gps) return;

    this.router.get("/api/gps", (ctx) => {
      ctx.response.body = this.get();
    });

    this.router.get("/api/gps/raw", (ctx) => {
      const state = gps.get();
      ctx.response.body = state;
    });

    app.httpUse(this.router.routes());

    app.ioUse((io) => {
      io.on('connection', (socket) => {
        console.log("connect:", socket.id);
      });
      const network = app.feature("network") as NetworkFeature;
      gps.on("data:GGA", (data) => {
        if (data) {
          const result = this.get();
          io.emit("/api/gps:get", result);
          io.emit("onMove", {
            network: {
              ip: network.get()?.address,
              mac: network.get()?.mac,
            },
            track: result.track,
            lat: result.latitude,
            lon: result.longitude,
            speed: result.speed,
            time: result.time,
          });
          if (result.is_fixed) {
            io.emit("/api/gps/fixed:get", result);
          }
        }
      });
    });
  }

  public get() {
    const state = (this.gps as GPS).get_state();
    return {
      time: state.time,
      latitude: state.lat,
      longitude: state.lon,
      speed: state.speed,
      track: state.track,
      altitude: state.alt,
      is_fixed: state.quality,
      fixed_type: state.fix,
      hdop: state.hdop,
      vdop: state.vdop,
      pdop: state.pdop,
      satellites: state.satellites,
    };
  }
}
