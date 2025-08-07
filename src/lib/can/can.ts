import { CANFactory, CANOptions } from "./types.ts";
import { CANNetAdapter } from "./net-adapter.ts";

class CAN extends CANFactory {
  public socket;

  constructor(options: CANOptions) {
    super();
    this.socket = options.socket;
  }

  public read(name: string) {
    return this.socket.read(name);
  }
  public write(name: string, value: string) {
    this.socket.write(name, value);
  }
}

export default CAN;

if (import.meta.main) {
  const adapter = new CANNetAdapter({
    auto: true,
  });
  adapter.on("data", (data) => {
    console.log(data);
  });
  adapter.read("vcan0");
  console.log((await adapter.list()).filter((netin) => netin.type === "can"));
}
