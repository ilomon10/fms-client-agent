import { Application } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";
import type {
  CycleSettingAttributes,
  EquipmentAttributes,
  EventAttributes,
  LocationAttributes,
  OkResponse,
  SiteSettings,
} from "../types/index.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import path from "node:path";
import { isDirExists } from "../helpers/dir.ts";
import { performance } from "node:perf_hooks";

export type ServerConfig = {
  host: string;
  port: number;
  apiKey: string;
};

export class FetcherFeature extends Feature {
  public name = "data-fetcher";
  public status: FeatureStatus;
  private baseUrl: string = "";
  private models: ModelInstances;
  private _jsonPath: string;

  constructor() {
    super();
    this.status = "OK";
    this.models = new LocalModels({ sync: false }).models;
    const homeDir = Deno.env.get("HOME") ?? "";
    const dotConfig = path.resolve(homeDir, ".config", "tracker");
    if (!isDirExists(dotConfig)) {
      Deno.mkdirSync(dotConfig);
    }
    const projectRootDir = path.resolve("./");
    console.log({ projectRootDir, dotConfig });
    this._jsonPath =
      Deno.env.get("DENO_ENV") === "development" ? projectRootDir : homeDir;
  }

  async register(_: Application) {
    const serverConfig = _.get<ServerConfig>("server");
    if (typeof serverConfig === "undefined") return;
    // console.log(this._jsonPath);

    this.baseUrl = `http://${serverConfig.host}:${serverConfig.port}`;
    const fetcher = new Fetcher({
      baseUrl: this.baseUrl,
      apiKey: serverConfig.apiKey,
    });
    let start = performance.now();
    const {
      data: { data: equipment },
    } = await fetcher.get<OkResponse<EquipmentAttributes[]>>(
      "/api/apps/equipments",
    );
    start = performance.now() - start;
    console.info(
      "Fetching equipment data completed in:",
      start.toFixed(2),
      "ms",
    );
    start = performance.now();
    const {
      data: { data: locations },
    } = await fetcher.get<OkResponse<Array<LocationAttributes>>>(
      "/api/apps/locations",
    );
    start = performance.now() - start;
    console.info(
      "Fetching locations data completed in:",
      start.toFixed(2),
      "ms",
    );
    start = performance.now();
    const {
      data: { data: events },
    } =
      await fetcher.get<OkResponse<Array<EventAttributes>>>("/api/apps/events");
    start = performance.now() - start;
    console.info("Fetching events data completed in:", start.toFixed(2), "ms");
    start = performance.now();
    const {
      data: { data: cycleSettings },
    } = await fetcher.get<OkResponse<CycleSettingAttributes>>(
      "/api/apps/cycle-settings",
    );
    start = performance.now() - start;
    console.info("Cycle settings data fetched in:", start.toFixed(2), "ms");
    start = performance.now();
    const {
      data: { data: siteSettings },
    } = await fetcher.get<OkResponse<SiteSettings>>("/api/apps/shifts");
    start = performance.now() - start;
    console.info("Site settings data fetched in:", start.toFixed(2), "ms");

    Deno.writeTextFileSync(
      path.resolve(this._jsonPath, "cycle-settings.json"),
      JSON.stringify(cycleSettings),
    );
    console.info("cycle setting data has been saved to disk");

    Deno.writeTextFileSync(
      path.resolve(this._jsonPath, "shifts.json"),
      JSON.stringify(siteSettings),
    );
    console.info("shift setting data has been saved to disk");

    const { Location, Equipment, Event } = this.models;

    await Promise.allSettled(
      events.map(async (event) => {
        const availableEvent = await Event.findOne({
          where: { svr_id: event.id },
        });
        const { id: svr_id, ...ev } = event;
        if (availableEvent === null) {
          return await Event.create({ svr_id, ...ev });
        }
        return availableEvent;
      }),
    );

    await Promise.allSettled(
      locations.map(async (loc) => {
        const availableLoc = await Location.findOne({
          where: { svr_id: loc.id },
          logging: false,
        });
        const { id, ...svrLoc } = loc;
        if (availableLoc === null)
          return await Location.create(
            { svr_id: id, ...svrLoc },
            { logging: false },
          );

        return availableLoc;
      }),
    );
    await Promise.allSettled(
      equipment.map(async (eqp) => {
        const availableEqp = await Location.findOne({
          where: {
            svr_id: eqp.id,
          },
          logging: false,
        });
        const { id, category } = eqp;
        const category_ = category;
        if (availableEqp === null)
          return await Equipment.create(
            {
              svr_id: id,
              category: category_,
              asset_name: eqp.asset_name,
              hull_number: eqp.hull_number,
              fuel_capacity: eqp.fuel_capacity,
              subcategory: eqp.subcategory,
              class: eqp.class,
              uuid: eqp.uuid,
              project: eqp.project,
              oracle_number: eqp.oracle_number,
              hour_meter: eqp.hour_meter,
              status: eqp.status,
              tonnage: eqp.tonnage,
              tonnes_per_hour: eqp.tonnes_per_hour,
              truck_factor: eqp.truck_factor,
              commdate: eqp.commdate,
              default_act: eqp.default_act,
              ext_id: eqp.ext_id,
              model: eqp.model,
              ownership_type: eqp.ownership_type,
            },
            { logging: false },
          );

        return availableEqp;
      }),
    );
    // const eqp = await this.models.Equipment.findAll();
    // console.log(eqp, data);
  }

  insertToDB<T>(data: Array<T>) {
    console.log(data);
  }

  // async getDataFromDB<T>(query:)
}
