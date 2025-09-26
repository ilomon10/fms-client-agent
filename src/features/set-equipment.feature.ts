import { InferAttributes } from "sequelize";
import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { EquipmentModel } from "../schemas/equipment.sequelize.ts";
import { RouterContext } from "oak";

type SetEquipmentPostBody = {
  equipment_id: number;
};

// type EquipmentRouteType = RouterContext<'/api/equipment'

export class SetEquipmentFeature extends Feature {
  name = "set-equipment";
  public override status: FeatureStatus;
  private _models: ModelInstances = new LocalModels({ sync: false }).models;

  constructor() {
    super();
    this.status = "OK";
  }

  public override register(app: Application): void | Promise<void> {
    const routers = new Router();

    routers.post("/api/equipment/set", this._handleSetEquipment);

    app.httpUse(routers.routes());
  }

  private async _handleSetEquipment(
    context: RouterContext<"/api/equipment/set">,
  ) {
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
  }

  private setEquipment(equipment: InferAttributes<EquipmentModel>) {
    const stringifiedData = JSON.stringify({
      id: equipment.id,
      uuid: equipment.uuid,
    });

    Deno.writeTextFileSync("equipment.json", stringifiedData);
  }
}
