import { Application } from "oak";
import { Feature, FeatureStatus } from "../feature.ts";
import { Fetcher } from "../lib/fetcher/fetcher.ts";

export class FetcherFeature extends Feature {
  public name = "data-fetcher";
  public status: FeatureStatus;

  constructor() {
    super();
    this.status = "OK";
  }

  public register(_: Application) {}
}
