import { createNanoEvents, Emitter } from "nanoevents";
import GPSParser from "gps";

export type GPSOptions = {
  /** if true, starts reading immediately */
  auto?: boolean;
  /** path to serial device (e.g. COM3 on Windows or /dev/ttyACM0 on Linux) */
  portPath: string;
  /** baud rate (currently only for documentation; you must configure the port externally with stty or equivalent) */
  baudRate?: number;
};

export interface GPSEvents {
  /** fired every time a full fix with lat+lon is parsed */
  data: (state: GPSParser.GPSState) => void;
  error: (error: Error) => void;
}

export default class GPS {
  private emitter: Emitter<GPSEvents>;
  private parser = new GPSParser();
  private port!: Deno.FsFile;
  private decoder = new TextDecoder();
  private buffer = new Uint8Array(1024);
  private running = false;
  private options: GPSOptions;

  constructor(options: GPSOptions) {
    this.options = options;
    this.emitter = createNanoEvents<GPSEvents>();
    this.openPort();
    if (this.options.auto) {
      this.start();
    }
  }

  /** open the serial device for reading */
  private openPort() {
    this.port = Deno.openSync(this.options.portPath, { read: true });
  }

  /** start the read+parse loop */
  start() {
    if (this.running) return;
    this.running = true;
    this.readLoop();
  }

  /** stop reading and close the port */
  stop() {
    this.running = false;
    try {
      this.port.close();
    } catch {
      /*ignore*/
    }
  }

  /** internal loop: read, parse, emit */
  private async readLoop() {
    while (this.running) {
      const n = await this.port.read(this.buffer);
      if (n === null) break; // port closed
      const chunk = this.decoder.decode(this.buffer.subarray(0, n));
      // feed it into the NMEA parser
      try {
        this.parser.updatePartial(chunk);
      } catch {}
      // whenever parser has a valid fix, gps.parser.state contains lat/lon
      const data = this.parser.state;
      this.emitter.emit("data", data);
    }
  }

  get() {
    return this.parser.state;
  }

  /** listen for fixes */
  on<E extends keyof GPSEvents>(event: E, cb: GPSEvents[E]) {
    return this.emitter.on(event, cb as any);
  }

  /** listen once */
  once<E extends keyof GPSEvents>(event: E, cb: GPSEvents[E]) {
    const unbind = this.emitter.on(event, (...args: unknown[]) => {
      unbind();
      (cb as any)(...args);
    });
    return unbind;
  }
}

if (import.meta.main) {
  const gps = new GPS({ portPath: "/dev/ttyACM0", auto: true });
  console.log("RUNNING");
  // fire once
  gps.once("data", (data) => {
    console.log("First fix:", data);
  });

  // continuous
  gps.on("data", (data) => {
    console.log("Fix:", data);
  });
}
