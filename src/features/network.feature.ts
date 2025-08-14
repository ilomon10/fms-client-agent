import { Application, Router } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import os from "node:os";

type NetworkConfigType = {
  interface: string;
};

export default class NetworkFeature extends Feature {
  public name = "network";
  public status: FeatureStatus;
  public config: NetworkConfigType;
  public router = new Router();

  constructor() {
    super();
    this.status = "OK";
    this.config = {
      "interface": "wlan0",
    };
  }

  register(app: Application) {
    this.config = Object.assign({}, app.get<NetworkConfigType>(this.name));

    if (os.platform() != "win32") {
      try {
        console.log("NETWORK: OK");
      } catch (err) {
        this.status = "FAIL";
        console.log("NETWORK: FAIL", err);
      }
    } else {
      this.status = "UNSUPPORTED";
      console.log("NETWORK: UNSUPPORTED");
    }

    // this.router.get("/api/gps", (ctx) => {
    //   ctx.response.body = this.get(gps);
    // });

    // this.router.get("/api/gps/raw", (ctx) => {
    //   const state = gps.get();
    //   ctx.response.body = state;
    // });

    // app.httpUse(this.router.routes());

    // app.ioUse((io) => {
    //   console.log(Deno.networkInterfaces());
    //   gps.on("data:GGA", (data) => {
    //     if (data) {
    //       const result = this.get(gps);
    //       io.emit("/api/gps:get", result);
    //       // io.emit("onMove", {
    //       //   network: {
    //       //     ip:
    //       //     mac:
    //       //   }
    //       // });
    //       if (result.is_fixed) {
    //         io.emit("/api/gps/fixed:get", result);
    //       }
    //     }
    //   });
    // });
  }

  public get() {
    const name = this.config.interface;
    if (!name) return null;
    const state = Deno.networkInterfaces().find((ifn) => ifn.name === name);
    if (!state) {
      return null;
    }
    return state;
  }
}
