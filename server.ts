import os from "node:os";
import { Application } from "./src/app.ts";
import CanFeature from "./src/features/can.feature.ts";
import GpioFeature from "./src/features/gpio.feature.ts";
import GpsFeature from "./src/features/gps.feature.ts";
import NetworkFeature from "./src/features/network.feature.ts";
import TrackerFeature from "./src/features/tracker.feature.ts";
import { FetcherFeature } from "./src/features/fetcher.feature.ts";
import { RedisService } from "./src/services/redis.service.ts";
import { ValkeyService } from "./src/services/valkey.service.ts";
import { SocketHandler } from "./src/handlers/socket.handler.ts";

export default function serve(options?: { port?: number }): Application {
  const app = new Application();
  const platform = os.platform();
  app.configure(new RedisService());
  app.configure(new ValkeyService());
  app.configure(new SocketHandler());
  app.configure(new FetcherFeature());
  app.configure(new NetworkFeature());
  app.configure(new CanFeature());
  app.configure(new GpioFeature());
  app.configure(new GpsFeature(platform === "win32"));
  app.configure(new TrackerFeature(app));
  app.serve(options);

  return app;
}

if (import.meta.main) {
  serve();
}
