import { serve } from "bun";
import { join } from "path";

const PORT = Number(process.env.PORT) || 8000;

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    if (path === "/") path = "/index.html";
    
    // Serve from public directory
    const filePath = join(import.meta.dir, "public", path);
    const file = Bun.file(filePath);
    
    if (await file.exists()) {
      return new Response(file);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
