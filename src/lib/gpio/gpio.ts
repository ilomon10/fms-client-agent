import { createNanoEvents, Emitter } from "nanoevents";

interface GPIOEvents {
  data: (data: { latitude: number; longitude: number }) => void;
}

export abstract class GPIOAdapter {
  abstract digitalRead(pin: string): boolean;
  abstract digitalWrite(pin: string, value: boolean): void;
  abstract analogRead(pin: string): boolean;
  abstract analogWrite(pin: string, value: number): void;
}

type GPIOOptions = {
  auto: boolean;

  socket: GPIOAdapter;
};

abstract class GPIOFactory {
  public emitter: Emitter<GPIOEvents>;
  abstract socket: GPIOAdapter;

  constructor() {
    this.emitter = createNanoEvents<GPIOEvents>();
  }

  on<E extends keyof GPIOEvents>(event: E, callback: GPIOEvents[E]) {
    return this.emitter.on(event, callback);
  }
  once<E extends keyof GPIOEvents>(event: E, callback: GPIOEvents[E]) {
    const unbind = this.emitter.on(event, (...args) => {
      unbind();
      callback(...args);
    });
    return unbind;
  }
}

class GPIO extends GPIOFactory {
  public socket;

  constructor(options: GPIOOptions) {
    super();
    this.socket = options.socket;
  }

  public digitalRead(pin: string) {
    return this.socket.digitalRead(pin);
  }
  public digitalWrite(pin: string, value: boolean) {
    this.socket.digitalWrite(pin, value);
  }
  public analogRead(pin: string) {
    return this.socket.analogRead(pin);
  }
  public analogWrite(pin: string, value: number) {
    this.socket.analogWrite(pin, value);
  }
}

export default GPIO;
