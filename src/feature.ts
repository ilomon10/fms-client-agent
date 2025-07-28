import { Application } from "./app.ts";

export type FeatureStatus = "OK" | "FAIL" | "UNSUPPORTED";

export abstract class Feature {
  public abstract name: string;
  public abstract status: FeatureStatus;
  public abstract register(app: Application): void | Promise<void>;
}
