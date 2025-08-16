import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import os from "node:os";
import GpsFeature from "./gps.feature.ts";
import GPS from "../lib/gps/gps.ts";
import { TrackerClient } from "../lib/tracker/tracker.ts";
import * as turf from "npm:@turf/turf";
import type NetworkFeature from "./network.feature.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { getNearestLocations } from "../helpers/geofence.ts";
import { memoize } from "../helpers/memo.ts";

type TrackerConfigType = {
  host: string;
};

export default class TrackerFeature extends Feature {
  public name = "tracker";
  public status: FeatureStatus;
  public config: TrackerConfigType;
  public router = new Router();

  private _trackerClient: TrackerClient | null = null;
  private _models: ModelInstances;

  constructor() {
    super();
    this.status = "OK";
    this.config = {
      host: "127.0.0.1",
    };
    const sync = Deno.env.get("DENO_ENV") === "development";
    this._models = new LocalModels({ sync }).models;
  }

  async register(app: Application) {
    let gps: GPS | null = null;
    this.config = Object.assign({}, app.get<TrackerConfigType>(this.name));

    this._trackerClient = new TrackerClient(this.config.host);
    if (this._trackerClient === null) {
      throw new Error(`Tracker Client not available`);
    }
    const { Location } = this._models;

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
    const locations = await Location.findAll({ logging: false });

    app.ioUse((io) => {
      const network = app.feature("network") as NetworkFeature;
      gps.on("data:GGA", async (data) => {
        if (data) {
          // console.log("here inside if data");
          const result = gps.get_state();

          if (typeof result.speed !== "undefined" && result.speed > 0.3) {
            let nearestLocation: string | null = null;
            try {
              const currentLocation = turf.point([
                result.lon ?? 0,
                result.lat ?? 0,
              ]);

              const nearestLocations = getNearestLocations({
                locations,
                distanceThreshold: 20,
                currentLocation,
              });

              if (nearestLocations.length > 0) {
                const [loc] = nearestLocations;
                nearestLocation = loc.name;

                // console.log("nearest loc:", loc.name);
              }
              const bb = await this._trackerClient?.push({
                ...result,
                ip: network.get()?.address,
                mac: network.get()?.mac,
                location_name: nearestLocation,
              });
            } catch {
              // TODO: save to local.db
            }
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
