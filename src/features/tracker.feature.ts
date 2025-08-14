import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import os from "node:os";
import GpsFeature from "./gps.feature.ts";
import GPS from "../lib/gps/gps.ts";
import { TrackerClient } from "../lib/tracker/tracker.ts";
import type NetworkFeature from "./network.feature.ts";

type TrackerConfigType = {
  host: string;
};

export default class TrackerFeature extends Feature {
  public name = "tracker";
  public status: FeatureStatus;
  public config: TrackerConfigType;
  public router = new Router();

  private _trackerClient: TrackerClient | null = null;

  constructor() {
    super();
    this.status = "OK";
    this.config = {
      "host": "127.0.0.1",
    };
  }

  register(app: Application) {
    let gps: GPS | null = null;
    this.config = Object.assign({}, app.get<TrackerConfigType>(this.name));

    this._trackerClient = new TrackerClient(this.config.host);
    if (this._trackerClient === null) {
      throw new Error(`Tracker Client not available`);
    }

    if (os.platform() != "win32") {
      try {
        const gpsFeat = app.feature("gps") as GpsFeature;
        gps = gpsFeat.gps;
        if (!gps || gpsFeat.status != "OK") {
          throw new Error(`GPS ${gpsFeat.status}`);
        }
        console.log("TRACKER: OK");
      } catch (err) {
        this.status = "FAIL";
        console.log("TRACKER: FAIL", err);
      }
    } else {
      this.status = "UNSUPPORTED";
      console.log("TRACKER: UNSUPPORTED");
    }

    if (!gps) return;

    app.ioUse((io) => {
      const network = app.feature("network") as NetworkFeature;
      gps.on("data:GGA", async (data) => {
        if (data) {
          const result = gps.get_state();
          if (typeof result.speed !== "undefined" && result.speed > 0.6) {
            const bb = await this._trackerClient?.push({
              ...result,
              ip: network.get()?.address,
              mac: network.get()?.mac,
            });
            console.log(bb);
          }
        }
      });
    });
  }

  // public get() {
  //   const name = this.config.interface;
  //   if (!name) return null;
  //   const state = Deno.networkInterfaces().find((ifn) => ifn.name === name);
  //   if (!state) {
  //     return null;
  //   }
  //   return state;
  // }
}
