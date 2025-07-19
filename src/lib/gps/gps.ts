import { ReadlineParser, SerialPort } from "serialport";
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
  private port: SerialPort;
  constructor(options: GPSOptions) {
    this.emitter = createNanoEvents<GPSEvents>();
    this.options = options;
    this.port = new SerialPort({
      path: "COM11",
      baudRate: 115200,
      autoOpen: true,
    });

    this.setup();
  }

  setup() {
    // const parser = new ReadlineParser();
    // this.port.pipe(parser);
    // this.port.on("data", (data) => {
    //   console.log("DATA: ", data);
    // });
  }

  async list() {
    return await SerialPort.list();
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

if (import.meta.main) {
  const port = new SerialPort({
    path: "COM11",
    baudRate: 115200,
    autoOpen: true,
  });
  console.log("RUNNING");

  port.on("open", () => {
    console.log("OPEN");
  });
  port.on("data", (data) => {
    console.log("DATA:", data);
  });
  port.on("error", (err) => {
    console.error(err);
  });
  port.on("close", () => {
    console.log("CLOSE");
  });
}
