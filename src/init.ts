import { isFileExists } from "./helpers/file.ts";
import { LocalModels } from "./lib/db/sequelize.ts";
import { Fetcher } from "./lib/fetcher/fetcher.ts";
import {
  CycleSettingAttributes,
  OkResponse,
  SiteSettings,
} from "./types/index.ts";
import { isAxiosError } from "axios";
export type InitializeOptions = {
  initialServer?: string;
  initialServerPort?: number;
  initialApiKey?: string;
};

export default async function (options?: InitializeOptions) {
  try {
    const fileExists = [
      isFileExists("cycle-settings.json"),
      isFileExists("shifts.json"),
    ];

    // console.log(fileExists, options);
    // const isShiftSettingExists = isFileExists("shifts.json");

    if (
      typeof options !== "undefined" &&
      typeof options.initialApiKey !== "undefined" &&
      typeof options.initialServerPort !== "undefined" &&
      typeof options.initialServer !== "undefined"
    ) {
      // console.log("here");
      console.log("pulling data from server");
      const { initialServer, initialServerPort, initialApiKey } = options;
      const fetcher = new Fetcher({
        baseUrl: `http://${initialServer}:${initialServerPort}/api/apps`,
        apiKey: initialApiKey,
      });
      const isConfigExists = fileExists.every((file) => !file);

      if (isConfigExists) {
        const [cycleSettings, shifts] = await Promise.all([
          fetcher.get<OkResponse<CycleSettingAttributes>>("/cycle-settings"),
          fetcher.get<OkResponse<SiteSettings>>("/shifts"),
        ]);

        Deno.writeTextFileSync(
          "cycle-settings.json",
          JSON.stringify(cycleSettings.data.data),
        );
        Deno.writeTextFileSync("shifts.json", JSON.stringify(shifts.data.data));
        console.log("FMS config loaded");
        // configs.forEach()
      }
    }

    await Deno.readTextFile("config.json");
    console.log("`config.json` file was already exsist");
    const models = new LocalModels({});
    await models.sync({ alter: true });
  } catch (e) {
    if (isAxiosError(e)) {
      console.log(e.message);
    }
    await Deno.writeTextFile(
      "config.json",
      JSON.stringify(
        {
          server: {
            host: options?.initialServer ?? "127.0.0.1",
            port: options?.initialServerPort ?? 3000,
            apiKey: options?.initialApiKey ?? "",
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
