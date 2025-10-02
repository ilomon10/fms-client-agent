import type {
  EventAttributes,
  OkResponse,
  SessionAttributes,
} from "../types/index.ts";
import { Application, Router } from "../app.ts";
import { AuthTokenEvent, EventUpdateData } from "../handlers/socket.handler.ts";
import { EventListener } from "../listener.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";
import { ServerConfig } from "../features/fetcher.feature.ts";
import { LocalModels, ModelInstances } from "../lib/db/sequelize.ts";
import { internalEvents } from "../consts/index.ts";
import { SessionModel } from "../schemas/session.sequelize.ts";
import { isAxiosError } from "axios";

export class FetchDataListener extends EventListener {
  name = "fetch-data";
  private _fetcher: Fetcher | null = null;
  private _models: ModelInstances;
  private _session: SessionModel | null = null;
  private router = new Router();

  constructor() {
    super();
    // this._fetcher = new Fetcher({ baseUrl: "", apiKey: "" });
    this._models = new LocalModels({
      sync: false,
      logging: false,
      alter: false,
    }).models;
    this.init.bind(this);
    this.notifyFrontend.bind(this);
  }

  init(app: Application) {
    const evt = app.emitter;
    this.notifyFrontend(app);
    const { host, port, apiKey } = app.get("server") as ServerConfig;
    this._fetcher = new Fetcher({
      baseUrl: `http://${host}:${port}/api`,
      apiKey,
    });
    const { Equipment, Session } = this._models;
    if (this._fetcher === null) return;
    // const valkey = app.get("glideClient") as GlideClient;
    this.router.get("/api/session", (ctx) => {
      ctx.response.body = {
        data: this._session,
      };
    });

    app.httpUse(this.router.routes());
    // const data = await valkey.hget("auth:token", "auth:token");
    // this.
    evt.on(
      internalEvents.AUTH,
      async ({ token, equipment_uuid }: AuthTokenEvent) => {
        console.info("initiliazing auth data");
        try {
          const [
            equipment,
            {
              data: { data },
            },
          ] = await Promise.all([
            Equipment.findOne({
              where: {
                uuid: equipment_uuid,
              },
            }),
            this._fetcher!.get<OkResponse<SessionAttributes>>("/apps/session", {
              headers: {
                Authorization: `Bearer ${token}`,
                "equipment-uuid": equipment_uuid,
              },
            }),
          ]);

          console.log("Your equipment is:", equipment?.hull_number);
          console.log("Logged in as:", data.operator_name);

          if (equipment === null) return;
          console.log("initializing session");

          app.set("equipment_uuid", equipment_uuid);
          app.set("session_id", data.id);
          app.set("token", token);

          let availableSession = await Session.findOne({
            where: { svr_id: data.id },
          });
          if (availableSession === null) {
            availableSession = await Session.create({
              svr_id: data.id,
              equipment_id: data.equipment_id,
              equipment_hull_number: data.equipment_hull_number,
              equipment_type: data.equipment_type,
              operator_id: data.operator_id,
              dumping_location_id: data.dumping_location_id,
              loading_location_id: data.loading_location_id,
              event_code: data.event_code,
              event_description: data.event_description,
              event_id: data.event_id,
              event_status: data.event_status,
              excavator_hull_number: data.exca_hull_number,
              excavator_id: data.exca_id,
              previous_event_id: data.previous_event_id,
              material_id: data.material_id,
              job_type: data.job_type,
              is_active: true,
              operator_name: data.operator_name ?? "-",
              shift: data.shift,
            });
          }

          if (this._session === null) {
            app.emitter.emit(internalEvents.GEOFENCE_START, {
              session: availableSession.toJSON(),
              token,
              equipment_uuid,
            });
          } else {
            app.emitter.emit(internalEvents.AUTH_UPDATE, {
              session: availableSession.toJSON(),
              token,
              equipment_uuid,
            });
          }

          this._session = availableSession;
          // app.emitter.
        } catch (error) {
          if (isAxiosError(error)) {
            console.log(error.response?.data);
          } else {
            console.error("Something unexpected happenned:", error);
          }
          // console.log(error);
        }
      },
    );

    evt.on(internalEvents.EVENT_UPDATE, async (data: EventUpdateData) => {
      if (this._session === null) return;
      // const currentEvent = await this._models

      const updated = await this._session.update({
        event_id: data.currentEventId,
        event_description: data.currentEventDescription,
        event_code: data.currentEventCode,
        event_status: data.currentEventStatus,
      });

      this._session = updated;
    });

    evt.on(internalEvents.AUTH_LOGOUT, async (data: EventAttributes) => {
      await this._session?.update({
        is_active: false,
        event_id: data.id,
        event_description: data.description,
        event_code: data.code,
        event_status: data.status,
        // previous_event_id
      });
      this._session = null;
    });
  }

  private notifyFrontend(app: Application) {
    let timeoutId: number | null = null;
    app.ioUse((socket) => {
      socket.on("connection", (io) => {
        if (timeoutId !== null) clearTimeout(timeoutId);
        if (this._session === null) {
          timeoutId = setTimeout(() => {
            console.log("[info]: requesting auth data from gridlock");
            io.emit(internalEvents.AUTH, { request: true, reason: "restart" });
          }, 300);
        }

        this._models.Session.addHook("afterCreate", (session) => {
          io.emit(internalEvents.AUTH, session.toJSON());
        });

        this._models.Session.addHook("afterUpdate", (session) => {
          io.emit(internalEvents.AUTH_UPDATE, session.toJSON());
        });
      });
    });
  }

  public override unregister(): void {
    console.log("unregistered");
  }
}
