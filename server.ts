import os from "node:os";
import { Application } from "./src/app.ts";
import CanFeature from "./src/features/can.feature.ts";
import GpioFeature from "./src/features/gpio.feature.ts";
import GpsFeature from "./src/features/gps.feature.ts";
import NetworkFeature from "./src/features/network.feature.ts";
import TrackerFeature from "./src/features/tracker.feature.ts";

export default function serve(options?: { port?: number }): Application {
  const app = new Application();
  const platform = os.platform();
  app.configure(new NetworkFeature());
  app.configure(new CanFeature());
  app.configure(new GpioFeature());
  app.configure(new GpsFeature(platform === "win32"));
  app.configure(new TrackerFeature());
  app.serve(options);

  return app;
}

if (import.meta.main) {
  serve();
}
