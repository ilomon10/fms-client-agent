import { Application } from "./src/app.ts";
import GpsFeature from "./src/features/gps.feature.ts";
import os from "node:os";

const app = new Application();

app.configure(new GpsFeature());

export default function serve(options?: { port?: number }) {
  app.serve(options);
}

if (import.meta.main) {
  app.serve();
}
