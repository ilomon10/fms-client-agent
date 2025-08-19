import { LocalModels } from "./lib/db/sequelize.ts";
export type InitializeOptions = {};

export default async function (options?: InitializeOptions) {
  try {
    await Deno.readTextFile("config.json");
    console.log("`config.json` file was already exsist");
    const _d = new LocalModels({ sync: true });
  } catch {
    await Deno.writeTextFile(
      "config.json",
      JSON.stringify(
        {
          server: {
            host: "127.0.0.1",
            port: 3000,
            apiKey: "",
          },
          gps: {
            type: "serialport",
            path: "/dev/ttyACM0",
          },
          can: {
            type: "network",
          },
          network: {
            interface: "wlo1",
          },
          tracker: {
            host: "http://127.0.0.1:8080",
          },
          redis: {
            url: "127.0.0.1:6379",
          },
        },
        null,
        2,
      ),
    );
    console.log("`config.json` file was created");
  }
}
