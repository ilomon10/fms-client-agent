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
import {
  createSessionModel,
  SessionIntance,
} from "../../schemas/session.sequelize.ts";
import {
  createEventModel,
  EventInstance,
} from "../../schemas/event.sequelize.ts";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve("local.db"),
  logging: false, // Deno.env.get("DENO_ENV") === "development",
});

export type ModelInstances = {
  Equipment: EquipmentInstance;
  Event: EventInstance;
  Location: LocationInstance;
  Session: SessionIntance;
  DelayedData: DelayedDataInstance;
};

export class LocalModels {
  public models: ModelInstances;
  constructor({
    sync,
    alter,
    force,
    logging,
  }: {
    force?: boolean;
    sync?: boolean;
    alter?: boolean;
    logging?: boolean;
  }) {
    this.models = {
      Equipment: createEquipmentModel(sequelize),
      Event: createEventModel(sequelize),
      Location: createLocationModel(sequelize),
      Session: createSessionModel(sequelize),
      DelayedData: createDelayedDataModel(sequelize),
    };

    if (sync) this.sync({ alter: alter ?? false, logging, force });
  }

  public async sync(opts?: {
    alter: boolean;
    logging?: boolean;
    force?: boolean;
  }) {
    return await sequelize
      .sync({
        alter: opts?.alter,
        force: opts?.force,
        logging: opts?.logging,
      })
      .then((res) => {
        console.log("Sync DB success");
        return res;
      });
  }
}
