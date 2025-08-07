import { createNanoEvents, Emitter } from "nanoevents";
import { CANAdapter, CANEvents, NetworkInterfaces } from "./types.ts";

type LinuxNetworkInterface = {
  ifindex: number;
  ifname: string;
  link_type: NetworkInterfaces["type"];
  flags: string[];
  mtu: number;
  qdisc: string;
  operstate: NetworkInterfaces["state"];
  linkmode: string;
  group: string;
  txqlen: number;
  address?: string;
  broadcast?: string;
};

type CANAdapterOptions = {
  auto: boolean;
};

export class CANNetAdapter extends CANAdapter {
  public name = "can-utils";
  private emitter: Emitter<CANEvents>;
  private running = false;

  constructor(private options: CANAdapterOptions) {
    super();
    this.emitter = createNanoEvents<CANEvents>();

    if (options.auto) {
      this.read("vcan0"); // default
    }
  }

  public async read(interfaceName: string): Promise<void> {
    try {
      const cmd = new Deno.Command("candump", {
        args: [interfaceName],
        stdout: "piped",
        stderr: "piped",
      });

      const child = cmd.spawn();
      const reader = child.stdout.getReader();
      const decoder = new TextDecoder();
      this.running = true;

      while (this.running) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        text.split("\n").forEach((line) => {
          if (line.trim()) {
            this.emitter.emit("data", line.trim());
          }
        });
      }

      reader.releaseLock();
    } catch (err) {
      this.emitter.emit("error", err as Error);
    }
  }

  public stop(): void {
    this.running = false;
  }

  public async write(interfaceName: string, frame: string): Promise<void> {
    await new Deno.Command("cansend", {
      args: [interfaceName, frame],
    }).output();
  }

  public async list(): Promise<NetworkInterfaces[]> {
    const cmd = new Deno.Command("ip", {
      args: ["-json", "link", "show"],
      stdout: "piped",
    });
    const output = await cmd.output();
    const decoder = new TextDecoder();
    const text = decoder.decode(output.stdout);
    const interfaces: LinuxNetworkInterface[] = JSON.parse(text);
    return interfaces.map((net): NetworkInterfaces => ({
      name: net.ifname,
      type: net.link_type,
      state: net.operstate,
    }));
  }

  public async get(): Promise<Record<string, any>> {
    return {};
  }

  public on<E extends keyof CANEvents>(event: E, cb: CANEvents[E]) {
    return this.emitter.on(event, cb as any);
  }

  public once<E extends keyof CANEvents>(event: E, cb: CANEvents[E]) {
    const unbind = this.emitter.on(event, (...args: unknown[]) => {
      unbind();
      (cb as any)(...args);
    });
    return unbind;
  }
}
