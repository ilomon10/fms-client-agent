import { Sequelize } from "npm:sequelize";
import * as path from "jsr:@std/path";
import {
  createEquipmentModel,
  EquipmentInstance,
} from "../../schemas/equipment.sequelize.ts";
import {
  createLocationModel,
  LocationInstance,
} from "../../schemas/location.sequelize.ts";
import {
  createDelayedDataModel,
  DelayedDataInstance,
} from "../../schemas/delayed-data.sequelize.ts";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve("local.db"),
  logging: Deno.env.get("DENO_ENV") === "development",
});

export type ModelInstances = {
  Equipment: EquipmentInstance;
  Location: LocationInstance;
  DelayedData: DelayedDataInstance;
};

export class LocalModels {
  public models: ModelInstances;
  constructor({
    sync,
    alter,
    force,
  }: {
    force?: boolean;
    sync?: boolean;
    alter?: boolean;
  }) {
    this.models = {
      Equipment: createEquipmentModel(sequelize),
      Location: createLocationModel(sequelize),
      DelayedData: createDelayedDataModel(sequelize),
    };

    if (sync) {
      sequelize
        .sync({
          alter,
          force,
        })
        .then(() => {
          console.log("Sync DB success");
        });
    }
  }
}
