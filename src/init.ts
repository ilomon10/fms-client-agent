export type InitializeOptions = {};

export default async function (options?: InitializeOptions) {
  try {
    await Deno.readTextFile("config.json");
    console.log("`config.json` file was already exsist");
  } catch {
    await Deno.writeTextFile(
      "config.json",
      JSON.stringify(
        {
          server: {
            host: "127.0.0.1",
            port: 3000,
          },
          gps: {
            type: "serialport",
            path: "ttyACM0",
          },
          can: {
            type: "network",
          },
        },
        null,
        2
      )
    );
    console.log("`config.json` file was created");
  }
}
