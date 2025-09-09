import { Application } from "./app.ts";

/**
 * this class usage is for internal event listeners
 */
export abstract class EventListener {
  public abstract name: string;
  // private _unbound:

  public abstract init(app: Application): void | Promise<void>;
  public abstract unregister(): void;
}
