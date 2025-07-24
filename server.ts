import { Application } from "./src/app.ts";
import gpsService from "./src/services/gps.service.ts";
import os from "node:os";

const app = new Application();

if (os.platform() !== "win32") {
  app.configure(gpsService);
}

export default function serve(options?: { port?: number }) {
  app.serve(options);
}

if (import.meta.main) {
  app.serve();
}
