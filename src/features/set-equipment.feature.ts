import { InferAttributes } from "sequelize";
import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { EquipmentModel } from "../schemas/equipment.sequelize.ts";
import { RouterContext } from "oak";
import { loadJSONFromFile } from "../helpers/file.ts";
import { EquipmentAttributes } from "../types/index.ts";

type SetEquipmentPostBody = {
  equipment_id: number;
};

// type EquipmentRouteType = RouterContext<'/api/equipment'

export class SetEquipmentFeature extends Feature {
  name = "set-equipment";
  public override status: FeatureStatus;
  private _models: ModelInstances;

  constructor() {
    super();
    this.status = "OK";
    this._models = new LocalModels({ sync: false }).models;
    this.setEquipment.bind(this);
  }

  public override register(app: Application): void | Promise<void> {
    const routers = new Router();

    routers.post("/api/equipment/set", this._handleSetEquipment);
    routers.get("/api/equipment", this.getEquipmetDetails);

    app.httpUse(routers.routes());
  }

  private getEquipmetDetails = async (
    context: RouterContext<"/api/equipment">,
  ) => {
    try {
      const { Equipment } = this._models;
      const equipmentDetail =
        loadJSONFromFile<EquipmentAttributes>("equipment.json");

      const data = await Equipment.findOne({
        where: {
          uuid: equipmentDetail.uuid,
        },
        rejectOnEmpty: new Error(
          `there is no equipment with an id of ${equipmentDetail.id}`,
        ),
      });

      context.response.body = {
        data: data,
      };
    } catch (error) {
      context.response.status = 500;
      if (error instanceof Error) {
        context.response.body = {
          errors: [
            {
              msg: error.message,
              stack: error.stack,
            },
          ],
          // data: null,
        };
      } else {
        context.response.body = {
          errors: [
            {
              msg: "Unexpected error occurred.",
            },
          ],
        };
      }
    }
  };

  private _handleSetEquipment = async (
    context: RouterContext<"/api/equipment/set">,
  ) => {
    try {
      const postBody: SetEquipmentPostBody = await context.request.body.json();

      const { Equipment } = this._models;

      const equipmentData = await Equipment.findOne({
        where: {
          svr_id: postBody.equipment_id,
        },
        rejectOnEmpty: new Error("couldn't find this equipment"),
      });

      this.setEquipment(equipmentData.toJSON());

      context.response.body = {
        equipment: equipmentData.toJSON(),
      };
    } catch (error) {
      context.response.status = 500;

      if (error instanceof Error)
        return (context.response.body = {
          error: {
            message: error.message,
            stack: error.stack,
          },
        });

      context.response.body = {
        errors: {
          error,
        },
      };
    }
  };

  private setEquipment(equipment: InferAttributes<EquipmentModel>) {
    const stringifiedData = JSON.stringify({
      id: equipment.svr_id,
      uuid: equipment.uuid,
    });

    Deno.writeTextFileSync("equipment.json", stringifiedData);
  }
}
