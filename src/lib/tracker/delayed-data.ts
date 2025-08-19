import { LocalModels, ModelInstances } from "../db/sequelize.ts";
import { DelayedDataModel } from "../../schemas/delayed-data.sequelize.ts";
import { TrackerConfigType } from "../../features/tracker.feature.ts";
import { TrackerClient } from "./tracker.ts";

export class DelayedData extends TrackerClient {
  private _models: ModelInstances;

  constructor(config: TrackerConfigType) {
    const { host } = config;
    super(host);
    this._models = new LocalModels({ sync: false }).models;
  }

  private getUnsyncedData() {
    const { DelayedData } = this._models;
    return DelayedData.findAll({
      where: {
        is_synced: false,
      },
    });
  }

  private async sendDelayedData(data: DelayedDataModel) {
    await this.axiosInstance.post("/delayed-tracker", {
      data: [data.toJSON()],
    });
    await data.update({ is_synced: true });

    return data;
  }

  public async sendData() {
    const delayedData: DelayedDataModel[] = await this.getUnsyncedData();

    return await Promise.allSettled(
      delayedData.map((data) => this.sendDelayedData(data)),
    );
  }
}
