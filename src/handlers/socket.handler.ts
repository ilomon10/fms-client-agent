import { Handler } from "../handler.ts";
import { Application } from "../app.ts";
import { internalEvents } from "../consts/index.ts";
import { EventAttributes } from "../types/index.ts";

export type AuthTokenEvent = {
  token: string | null;
  equipment_uuid: string;
};

export type EventUpdateData = {
  currentEventId: number;
  currentEventTimestamp: string;
  currentEventCode: string;
  lastActive: string;
  currentHourMeter: number;
  currentEventType: string;
  currentEventDescription: string;
  currentEventDescriptionInd: string;
  currentEventStatus: string;
};

export class SocketHandler extends Handler {
  name = "socket";

  public override register(app: Application): void | Promise<void> {
    // const valkey = app.get("glideClient") as GlideClient;
    app.ioUse((io) => {
      io.on("connection", (socket) => {
        socket.on(internalEvents.AUTH, (data: AuthTokenEvent) => {
          console.log("initializing geofence", data.token);
          app.emitter.emit(internalEvents.AUTH, data);
        });

        socket.on(internalEvents.EVENT_UPDATE, (data: EventUpdateData) => {
          app.emitter.emit(internalEvents.EVENT_UPDATE, data);
        });

        socket.on(internalEvents.AUTH_LOGOUT, (data: EventAttributes) => {
          console.log("logging out from the session");
          app.emitter.emit(internalEvents.AUTH_LOGOUT, data);
        });
      });
    });
  }
}
