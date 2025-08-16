import { Application } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";
import {
  EquipmentAttributes,
  LocationAttributes,
  OkResponse,
} from "../types/index.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";

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

  constructor() {
    super();
    this.status = "OK";
    this.models = new LocalModels({ sync: false }).models;
  }

  async register(_: Application) {
    const serverConfig = _.get<ServerConfig>("server");
    if (typeof serverConfig === "undefined") return;

    this.baseUrl = `http://${serverConfig.host}:${serverConfig.port}`;
    const fetcher = new Fetcher({
      baseUrl: this.baseUrl,
      apiKey: serverConfig.apiKey,
    });
    const {
      data: { data: equipment },
    } = await fetcher.get<OkResponse<EquipmentAttributes[]>>(
      "/api/apps/equipments",
    );
    const {
      data: { data: locations },
    } = await fetcher.get<OkResponse<Array<LocationAttributes>>>(
      "/api/apps/locations",
    );

    const { Location, Equipment } = this.models;

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
