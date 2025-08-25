import { GlideClient } from "@valkey/valkey-glide";
import { Handler } from "../handler.ts";
import { Application } from "../app.ts";

export type AuthTokenEvent = {
  token: string | null;
  equipment_uuid: string;
};

export class SocketHandler extends Handler {
  name = "socket";

  public override register(app: Application): void | Promise<void> {
    const valkey = app.get("glideClient") as GlideClient;
    app.ioUse((io) => {
      io.on("connection", (socket) => {
        socket.on("auth:token", async (data: AuthTokenEvent) => {
          console.log("auth:token data -", data);
          if (data.token !== null) await valkey.set("token", data.token);

          await valkey.set("equipment_uuid", data.equipment_uuid);
          await valkey.hset("auth:token", [
            { field: "apiKey", value: data.token ?? "" },
            { field: "equipment_uuid", value: data.equipment_uuid ?? "" },
          ]);
          app.emitter.emit("auth:token", data);
        });
      });
    });
  }
}
