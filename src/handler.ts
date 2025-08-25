import { Application } from "./app.ts";

/**
 *
 * This asbtract class be a handler class that
 * need to be registered to app main class.
 *
 */
export abstract class Handler {
  public abstract name: string;

  public abstract register(app: Application): void | Promise<void>;
}
