import { createNanoEvents, Emitter } from "nanoevents";

export interface CANEvents {
  data: (state: string) => void;
  error: (error: Error) => void;
}

export type NetworkInterfaces = {
  name: string;
  type: "loopback" | "ether" | "can";
  state: "UP" | "DOWN" | "UNKNOWN";
};

export abstract class CANAdapter {
  abstract name: string;
  abstract read(name: string): Promise<void>;
  abstract write(name: string, value: string): Promise<void>;

  abstract list(): Promise<NetworkInterfaces[]>;
}

export type CANOptions = {
  auto: boolean;

  socket: CANAdapter;
};

export abstract class CANFactory {
  public emitter: Emitter<CANEvents>;
  abstract socket: CANAdapter;

  constructor() {
    this.emitter = createNanoEvents<CANEvents>();
  }

  on<E extends keyof CANEvents>(event: E, cb: CANEvents[E]) {
    return this.emitter.on(event, cb as any);
  }

  once<E extends keyof CANEvents>(event: E, cb: CANEvents[E]) {
    const unbind = this.emitter.on(event, (...args: unknown[]) => {
      unbind();
      (cb as any)(...args);
    });
    return unbind;
  }
}
