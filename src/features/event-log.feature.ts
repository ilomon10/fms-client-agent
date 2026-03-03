import { RouterContext } from "oak";
import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import { LocalModels } from "../lib/db/sequelize.ts";
import { errorResponse } from "../helpers/errors.ts";

type EventLogRequestContext = RouterContext<"/api/event-logs">;

export class EventLogFeature extends Feature {
  public override name: string = "event-log";
  public override status: FeatureStatus;
  private _router = new Router();
  private _models = new LocalModels({ sync: false }).models;

  constructor() {
    super();
    this.status = "OK";
    this._handleEventLogPost.bind(this);
  }

  public override register(app: Application): void | Promise<void> {
    this._router.post("/api/event-logs", this._handleEventLogPost);
    this._router.post("/api/event-logs", this._getEventLogs);

    app.httpUse(this._router.routes());
  }

  private _getEventLogs = async (ctx: EventLogRequestContext) => {
    try {
      const eventLogs = await this._models.EventLog.findAndCountAll({
        order: [["timestamp", "asc"]],
      });

      ctx.response.status = 200;
      ctx.response.body = {
        data: eventLogs,
      };
    } catch (error) {
      ctx.response.status = 500;
      errorResponse(error);
    }
  };

  /**
   *
   * this method will handle local save for an event-log
   * @returns created eventLog;
   *
   */
  private _handleEventLogPost = async (ctx: EventLogRequestContext) => {
    try {
      const postBody = await ctx.request.body.json();
      const eventLog = await this._models.EventLog.create(postBody);

      ctx.response.status = 200;
      ctx.response.body = {
        data: eventLog,
      };
    } catch (error) {
      ctx.response.status = 500;
      errorResponse(error);
    }
  };
}
