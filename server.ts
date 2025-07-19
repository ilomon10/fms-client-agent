import http_server from "./src/http-server.ts";
import io_server from "./src/io-server.ts";

const handler = io_server.handler(async (req) => {
  return (await http_server.handle(req)) || new Response(null, { status: 404 });
});

export default function serve(options?: { port?: number }) {
  const { port } = options || {};
  Deno.serve({
    handler,
    port: port || 3000,
  });
}

if (import.meta.main) {
  serve();
}
