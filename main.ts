import serve from "./server.ts";
import { Command, EnumType } from "@cliffy/command";
import runTui from "./src/tui.tsx";
import initialize from "./src/init.ts";
import { LocalModels } from "./src/lib/db/sequelize.ts";

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
    .option("-p, --port <port:number>", "server port")
    .option("-h, --host <host:string>", "server host")
    .option("-K, --apiKey <apiKey:string>", "API Key")
    // .option("-f, --force <force:boolean>", "sequelize force renew db")
    .action((options) => {
      const { port, host, apiKey } = options;
      // console.log({ apiKey }, options);
      initialize({
        initialServerPort: port,
        initialServer: host,
        initialApiKey: apiKey,
      });
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
    .command("sync")
    .description("Sync DB")
    .option("-f, --force <force:boolean>", "force renew DB")
    .action(async (option) => {
      await new LocalModels({
        sync: true,
        force: option.force,
      }).sync({ force: option.force, alter: true });
      console.log("Sync completed");
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
