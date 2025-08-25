import { Application } from "./app.ts";

export abstract class EventListener {
  public abstract name: string;
  // private _unbound:

  public abstract init(app: Application): void | Promise<void>;
  public abstract unregister(): void;
}
