import { Application } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";
import { EquipmentAttributes, OkResponse } from "../types/index.ts";
import { CreateStore } from "../lib/db/db.ts";
import { equipmentDBSchema } from "../schemas/schemas.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { closestString } from "jsr:@std/text@~1.0.7/closest-string";

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
  }

  async register(_: Application) {
    this.models = new LocalModels({ sync: true, alter: true }).models;
    const serverConfig = _.get<ServerConfig>("server");
    if (typeof serverConfig === "undefined") return;

    this.baseUrl = `http://${serverConfig.host}:${serverConfig.port}`;
    const fetcher = new Fetcher({
      baseUrl: this.baseUrl,
      apiKey: serverConfig.apiKey,
    });
    const {
      data: { data },
    } = await fetcher.get<OkResponse<EquipmentAttributes>>(
      "/api/apps/equipments",
    );
    // const eqp = await this.models.Equipment.findAll();
    // console.log(eqp, data);
  }

  async insertToDB<T>(data: Array<T>) {}

  // async getDataFromDB<T>(query:)
}
