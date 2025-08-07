import { Application } from "./src/app.ts";
import CanFeature from "./src/features/can.feature.ts";
import GpioFeature from "./src/features/gpio.feature.ts";
import GpsFeature from "./src/features/gps.feature.ts";

export default function serve(options?: { port?: number }): Application {
  const app = new Application();

  app.configure(new CanFeature());
  app.configure(new GpioFeature());
  app.configure(new GpsFeature(true));
  app.serve(options);

  return app;
}

if (import.meta.main) {
  serve();
}
