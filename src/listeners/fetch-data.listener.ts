import { Application } from "../app.ts";
import { AuthTokenEvent } from "../handlers/socket.handler.ts";
import { EventListener } from "../listener.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";
import { GlideClient } from "@valkey/valkey-glide";

export class FetchDataListener extends EventListener {
  name = "fetch-data";
  private _fetcher: Fetcher;

  constructor() {
    super();
    this._fetcher = new Fetcher({ baseUrl: "", apiKey: "" });
  }

  async init(app: Application) {
    const evt = app.emitter;
    const valkey = app.get("glideClient") as GlideClient;

    const data = await valkey.hget("auth:token", "auth:token");
    console.log(data);
    // this.
    evt.on("data:token", ({ token, equipment_uuid }: AuthTokenEvent) => {});
  }

  public override unregister(): void {
    console.log("unregistered");
  }
}
