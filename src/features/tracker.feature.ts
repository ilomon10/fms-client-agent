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
import axios from "axios";
import { DelayedData } from "../lib/tracker/delayed-data.ts";
// import { RedisService } from "../services/redis.service.ts";
// import {RedisService} from '../services/redis.service.ts'

export type TrackerConfigType = {
  host: string;
};

export default class TrackerFeature extends Feature {
  public name = "tracker";
  public status: FeatureStatus;
  public config: TrackerConfigType;
  public router = new Router();

  private _trackerClient: TrackerClient | null = null;
  private _delayedTrackerClient: DelayedData;
  private _models: ModelInstances;

  constructor(app: Application) {
    super();
    this.status = "OK";
    this.config = {
      host: "127.0.0.1",
    };
    const sync = Deno.env.get("DENO_ENV") === "development";
    const config = Object.assign({}, app.get<TrackerConfigType>(this.name));

    this._models = new LocalModels({ sync }).models;
    this._delayedTrackerClient = new DelayedData(config);
    // this._redis = new RedisService();
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
    // const lastData = await gps.get_state_async();

    app.ioUse((_io) => {
      const network = app.feature("network") as NetworkFeature;
      gps.on("data:GGA", async (data) => {
        if (data) {
          // console.log("here inside if data");
          const result = gps.get_state();
          const now = Date.now();

          if (now % 60 === 0) {
            this._delayedTrackerClient.sendData();
          }

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

              const _bb = await this._trackerClient?.push({
                ...result,
                ip: network.get()?.address,
                mac: network.get()?.mac,
                location_name: nearestLocation,
              });
            } catch (e) {
              if (axios.isAxiosError(e)) {
                console.log(e);
                await this._models.DelayedData.create({
                  ...result,
                  ip_address: network.get()?.address,
                  mac_address: network.get()?.mac,
                });
              }
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
