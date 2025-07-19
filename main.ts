import serve from "./server.ts";
import { Command, EnumType } from "@cliffy/command";
import runTui from "./src/tui.ts";
import initialize from "./src/init.ts";

if (import.meta.main) {
  const serve_command = new EnumType(["start", "stop", "restart"]);

  new Command()
    .name("io-agent")
    .usage("<command>")
    .description("FMS I/O Forwarder utilities.")
    .version("0.1.0")

    .action(function () {
      this.showHelp();
    })

    // Setup Agent
    .command("init")
    .description("Initialize the I/O Agent.")
    .action(() => {
      initialize();
    })

    // Update client
    .command("upgrade")
    .description("to Update FMS app client.")
    .action(() => {
      console.log("Upgrading...");
      console.log("OK");
    })

    // Serve Server
    .command("serve")
    .type("serve_command", serve_command)
    .description("Serve REST and Socket server.")
    .option("-h, --host <host:string>", "server host")
    .option("-p, --port <port:number>", "server port")
    .arguments("<command:serve_command>")
    .action((options, command) => {
      if (command == "start") {
        serve(options);
      }
    })

    // TUI
    .command("tui")
    .description("UI based configuration.")
    .action(() => {
      runTui();
    })

    // Read the command line arguments
    .parse(Deno.args);
}
