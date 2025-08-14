import { Sequelize } from "npm:sequelize";
import * as path from "jsr:@std/path";
import {
  createEquipmentModel,
  EquipmentInstance,
} from "../../schemas/equipment.sequelize.ts";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve("local.db"),
});

export type ModelInstances = {
  Equipment: EquipmentInstance;
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
