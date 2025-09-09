import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";

export class SetEquipmentFeature extends Feature {
  name = "set-equipment";
  public override status: FeatureStatus;
  constructor() {
    super();
    this.status = "OK";
  }

  public override register(app: Application): void | Promise<void> {
    const routers = new Router();

    routers.post("/api/equipment/set", async (context) => {
      // TODO: apply set equipment feature
      const postBody = await context.request.body.json();

      context.response.body = {
        message: this.status,
        postBody,
      };
    });

    app.httpUse(routers.routes());
  }
}
