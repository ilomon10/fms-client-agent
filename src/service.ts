import { Application } from "./app.ts";

export abstract class Service {
  public abstract name: string;
  /**
   * Called when app.configure runs this service
   */
  public abstract init(app: Application): void | Promise<void>;
}
