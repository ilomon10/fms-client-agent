import { createNanoEvents, DefaultEvents, Emitter } from "nanoevents";

export class EventEmitter {
  public emitter: Emitter<DefaultEvents>;
  constructor() {
    this.emitter = createNanoEvents();
  }
}
