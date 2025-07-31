import { Application } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import os from "node:os";

type GpioConfigType = {
  path: string;
  type: "serialport";
};

export default class GpioFeature extends Feature {
  public name = "gpio";
  public status: FeatureStatus;
  public config: GpioConfigType;

  constructor() {
    super();
    this.status = "UNSUPPORTED";
    this.config = {
      "type": "serialport",
      "path": "COM11",
    };
  }

  register(app: Application) {
    this.config = Object.assign({}, app.get<GpioConfigType>("gpio"));
    if (os.platform() != "win32") {
    } else {
      this.status = "FAIL";
    }
  }
}
