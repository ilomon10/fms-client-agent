import { Application } from "./src/app.ts";
import gpsService from "./src/services/gps.service.ts";

const app = new Application();

app.configure(gpsService);

export default function serve(options?: { port?: number }) {
  app.serve(options);
}

if (import.meta.main) {
  app.serve();
}
