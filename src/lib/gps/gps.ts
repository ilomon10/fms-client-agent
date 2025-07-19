import { createNanoEvents, Emitter } from "nanoevents";

type GPSOptions = {
  auto: boolean;
};

interface GPSEvents {
  data: (data: { latitude: number; longitude: number }) => void;
}

class GPS {
  private options: GPSOptions;
  private emitter: Emitter<GPSEvents>;
  constructor(options: GPSOptions) {
    this.emitter = createNanoEvents<GPSEvents>();
    this.options = options;
  }

  on<E extends keyof GPSEvents>(event: E, callback: GPSEvents[E]) {
    return this.emitter.on(event, callback);
  }
  once<E extends keyof GPSEvents>(event: E, callback: GPSEvents[E]) {
    const unbind = this.emitter.on(event, (...args) => {
      unbind();
      callback(...args);
    });
    return unbind;
  }
}

export default GPS;
