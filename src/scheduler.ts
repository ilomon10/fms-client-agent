export abstract class Scheduler {
  public abstract name: string;

  public abstract init(): void | Promise<void>;
}
