import { createNanoEvents, Emitter } from "nanoevents";
import GPSParser from "gps";

export type GPSOptions = {
  auto?: boolean;
  portPath: string;
  baudRate?: number;
  emulate?: boolean;
};

export interface GPSEvents {
  data: (state: GPSParser.GPSState) => void;
  error: (error: Error) => void;
}

export default class GPS {
  private emitter: Emitter<GPSEvents>;
  private parser = new GPSParser();
  private port?: Deno.FsFile;
  private decoder = new TextDecoder();
  private buffer = new Uint8Array(1024);
  private running = false;
  private options: GPSOptions;

  constructor(options: GPSOptions) {
    this.options = options;
    this.emitter = createNanoEvents<GPSEvents>();

    if (!this.options.emulate) {
      this.openPort();
    }

    if (this.options.auto) {
      this.start();
    }
  }

  private openPort() {
    this.port = Deno.openSync(this.options.portPath, { read: true });
  }

  start() {
    if (this.running) return;
    this.running = true;

    if (this.options.emulate) {
      this.simulateLoop();
    } else {
      this.readLoop();
    }
  }

  stop() {
    this.running = false;
    try {
      this.port?.close();
    } catch {}
  }

  private async readLoop() {
    if (!this.port) return;

    while (this.running) {
      const n = await this.port.read(this.buffer);
      if (n === null) break;
      const chunk = this.decoder.decode(this.buffer.subarray(0, n));
      try {
        this.parser.updatePartial(chunk);
        this.emitter.emit("data", this.parser.state);
      } catch (err) {
        this.emitter.emit("error", err as Error);
      }
    }
  }

  /** simulate GPS fix every second */
  private async simulateLoop() {
    const sampleNMEASentences = [
      // GPGGA: Fix data
      "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47",
      // GPRMC: Recommended minimum specific GPS/Transit data
      "$GPRMC,123520,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A",
      // GPGSA: DOP and active satellites
      "$GPGSA,A,3,04,05,09,12,24,25,29,31,32,,,,1.8,1.0,1.5*33",
      // Another GPGGA sample
      "$GPGGA,092750.000,5321.6802,N,00630.3372,W,1,8,1.03,61.7,M,55.2,M,,*76",
      // Another GPRMC sample
      "$GPRMC,092751.000,A,5321.6802,N,00630.3372,W,0.13,309.62,120598,,,A*68",
      // Another GPGSA
      "$GPGSA,A,3,19,28,14,18,27,22,31,39,,,,,1.8,1.0,1.5*30",
    ];

    let i = 0;
    while (this.running) {
      const sentence = sampleNMEASentences[i % sampleNMEASentences.length];
      try {
        this.parser.update(sentence);
        this.emitter.emit("data", this.parser.state);
      } catch (err) {
        this.emitter.emit("error", err as Error);
      }
      i++;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  get() {
    return this.parser.state;
  }

  on<E extends keyof GPSEvents>(event: E, cb: GPSEvents[E]) {
    return this.emitter.on(event, cb as any);
  }

  once<E extends keyof GPSEvents>(event: E, cb: GPSEvents[E]) {
    const unbind = this.emitter.on(event, (...args: unknown[]) => {
      unbind();
      (cb as any)(...args);
    });
    return unbind;
  }
}

if (import.meta.main) {
  const gps = new GPS({
    portPath: "/dev/null", // dummy since we’re emulating
    emulate: true,
    auto: true,
  });

  console.log("Running mock GPS");

  gps.once("data", (data) => {
    console.log("First mock fix:", data);
  });

  gps.on("data", (data) => {
    console.log("Mock Fix:", data);
  });

  gps.on("error", (err) => {
    console.error("Error parsing mock data:", err);
  });
}
