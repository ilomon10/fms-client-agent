import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import os from "node:os";
import { CANNetAdapter } from "../lib/can/net-adapter.ts";

type CanConfigType = {
  path: string;
  type: "network";
};

export default class CanFeature extends Feature {
  public name = "can";
  public status: FeatureStatus;
  public config: CanConfigType;
  public router = new Router();
  public can: CANNetAdapter | null = null;

  constructor() {
    super();
    this.status = "OK";
    this.config = {
      "type": "network",
      "path": "vcan0",
    };
  }

  register(app: Application) {
    this.config = Object.assign({}, app.get<CanConfigType>(this.name));
    if (os.platform() != "win32") {
      try {
        this.can = new CANNetAdapter({
          auto: true,
        });
      } catch {
        this.status = "FAIL";
      }
    } else {
      this.status = "UNSUPPORTED";
    }

    const can = this.can;

    if (!can) return;

    this.router.get("/api/can", async (ctx) => {
      const state = await can.get();
      ctx.response.body = state;
    });
    this.router.get("/api/can/list", async (ctx) => {
      const state = await can.list();
      console.log(state);
      ctx.response.body = state;
    });

    app.httpUse(this.router.routes());
    app.ioUse((io) => {
      can.on("data", (data) => {
        if (data) {
          io.emit("/api/can:get", this.parseFrame(data));
          io.emit("/api/can/raw:get", data);
        }
      });
    });
  }

  private parseFrame(raw: string) {
    const regex =
      /^(\w+)\s+([0-9A-Fa-f]+)\s+\[(\d+)\]\s+((?:[0-9A-Fa-f]{2}\s*)+)$/;
    const match = raw.match(regex);

    return {
      channel: match?.[1] as string,
      id: match?.[2] as string,
      dlc: match?.[3] as string,
      data: match?.[4].trim().split(/\s+/) as string[],
    };
  }

  public async get() {
    if (!this.can) {
      return {};
    }
    const state = await this.can.get();
    return state;
  }
}
