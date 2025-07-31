import { Application } from "../app.ts";
import { Feature, FeatureStatus } from "../feature.ts";
import os from "node:os";

type CanConfigType = {
  path: string;
  type: "network";
};

export default class CanFeature extends Feature {
  public name = "can";
  public status: FeatureStatus;
  public config: CanConfigType;

  constructor() {
    super();
    this.status = "UNSUPPORTED";
    this.config = {
      "type": "network",
      "path": "can0",
    };
  }

  register(app: Application) {
    this.config = Object.assign({}, app.get<CanConfigType>(this.name));
    if (os.platform() != "win32") {
    } else {
      this.status = "FAIL";
    }
  }
}
