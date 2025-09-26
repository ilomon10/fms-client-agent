import { RouterContext } from "oak";
import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { LocalModels } from "../lib/db/sequelize.ts";

type EventLogRequestContext = RouterContext<"/api/event-logs">;

export class EventLogFeature extends Feature {
  public override name: string = "event-log";
  public override status: FeatureStatus;
  private _router = new Router();
  private _models = new LocalModels({ sync: false }).models;

  constructor() {
    super();
    this.status = "OK";
  }

  public override register(app: Application): void | Promise<void> {
    this._router.post("/api/event-logs", this._handleEventLogPost);

    app.httpUse(this._router.routes());
  }

  /**
   *
   * this method will handle local save for an event-log
   * @returns ctx;
   *
   */
  private async _handleEventLogPost(ctx: EventLogRequestContext) {
    try {
      const postBody = await ctx.request.body.json();
    } catch (error) {
      ctx.response.status = 500;
      if (error instanceof Error) {
        ctx.response.body = {
          errors: [
            {
              msg: error.message,
              stack: error.stack,
            },
          ],
        };
      } else {
        ctx.response.body = {
          errors: [
            {
              msg: "Unknown error occurred. Please contact developer",
            },
          ],
        };
      }
    }
  }
}
