import { Application } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";
import type {
  CycleSettingAttributes,
  EquipmentAttributes,
  EventAttributes,
  LocationAttributes,
  OkResponse,
  OperatorAttributes,
  SiteSettings,
} from "../types/index.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import path from "node:path";
import { isDirExists } from "../helpers/dir.ts";
import { performance } from "node:perf_hooks";
import { isNonNullish } from "../helpers/data.ts";

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
  private apiKey: string = "";

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

    this.register = this.register.bind(this);
    this.pullDataFromServer = this.pullDataFromServer.bind(this);
  }

  async register(_: Application) {
    const serverConfig = _.get<ServerConfig>("server");
    if (typeof serverConfig === "undefined") return;
    // console.log(this._jsonPath);

    this.baseUrl = `http://${serverConfig.host}:${serverConfig.port}`;
    this.apiKey = serverConfig.apiKey;
    const dataFromServer = await this.pullDataFromServer();
    if (!isNonNullish(dataFromServer)) return;
    const {
      events,
      equipments: equipment,
      locations,
      siteSettings,
      cycleSettings,
      operators,
    } = dataFromServer;

    this.writeConfig(
      path.resolve(this._jsonPath, "cycle-settings.json"),
      JSON.stringify(cycleSettings),
    );
    console.info("cycle setting data has been saved to disk");

    this.writeConfig(
      path.resolve(this._jsonPath, "shifts.json"),
      JSON.stringify(siteSettings),
    );
    console.info("shift setting data has been saved to disk");

    const [, , equipmentData, operatorsData] = await Promise.all([
      this.findOrCreateLocation(locations),
      this.findOrCreateEvent(events),
      this.findOrCreateEquipment(equipment),
      this.findOrCreateOperator(operators),
    ]);
    console.log(`Inserted ${equipmentData.length} data of equipment`);
    console.log(
      `There ${operatorsData.length > 1 ? "are" : "is"} ${operatorsData.length} new operators`,
    );
    // const eqp = await this.models.Equipment.findAll();
    // console.log(eqp, data);
  }

  private findOrCreateEvent(events: EventAttributes[]) {
    const { Event } = this.models;

    return Promise.allSettled(
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
  }

  private findOrCreateLocation(locations: Array<LocationAttributes>) {
    const { Location } = this.models;

    return Promise.allSettled(
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
  }

  private findOrCreateEquipment(equipment: Array<EquipmentAttributes>) {
    const { Equipment } = this.models;

    return Promise.allSettled(
      equipment.map(async (eqp) => {
        const availableEqp = await Equipment.findOne({
          where: {
            svr_id: eqp.id,
            uuid: eqp.uuid,
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
  }

  private async pullDataFromServer() {
    if (this.baseUrl.length === 0 && this.apiKey.length === 0) return null;

    const fetcher = new Fetcher({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
    });

    const t0 = performance.now();

    try {
      const [
        equipments,
        locations,
        events,
        cycleSettings,
        siteSettings,
        operators,
      ] = await Promise.all([
        fetcher.get<OkResponse<EquipmentAttributes[]>>("/api/apps/equipments"),
        fetcher.get<OkResponse<LocationAttributes[]>>("/api/apps/locations"),
        fetcher.get<OkResponse<Array<EventAttributes>>>("/api/apps/events"),
        fetcher.get<OkResponse<CycleSettingAttributes>>(
          "/api/apps/cycle-settings",
        ),
        fetcher.get<OkResponse<SiteSettings>>("/api/apps/shifts"),
        fetcher.get<OkResponse<Array<OperatorAttributes>>>("/api/apps/users"),
      ]);

      const t1 = performance.now();

      console.log(`Fetched data in ${(t1 - t0).toFixed(2)}ms`);

      return {
        equipments: equipments.data.data,
        locations: locations.data.data,
        events: events.data.data,
        cycleSettings: cycleSettings.data.data,
        siteSettings: siteSettings.data.data,
        operators: operators.data.data,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private findOrCreateOperator(operators: Array<OperatorAttributes>) {
    const { Operator } = this.models;

    return Promise.allSettled(
      operators.map(async (operator) => {
        const currentOperator = await Operator.findOne({
          where: {
            svr_id: operator.id,
          },
        });

        if (isNonNullish(currentOperator)) return currentOperator;

        const { id, ...operatorAttrs } = operator;

        return await Operator.create({
          svr_id: id,
          created_by: "System",
          ...operatorAttrs,
        });
      }),
    );
  }

  private writeConfig(path: string, content: string) {
    Deno.writeTextFileSync(path, content);
  }

  insertToDB<T>(data: Array<T>) {
    console.log(data);
  }

  // async getDataFromDB<T>(query:)
}
