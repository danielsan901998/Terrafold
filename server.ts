import { serve } from "bun";
import { join } from "path";

const PORT = Number(process.env.PORT) || 8000;

interface CacheEntry {
  content: Uint8Array;
  gzip: Uint8Array | null;
  etag: string;
  lastModified: string;
  contentType: string;
}

const cache = new Map<string, CacheEntry>();

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    if (path === "/") path = "/index.html";
    
    let entry = cache.get(path);
    
    if (!entry) {
      const filePath = join(import.meta.dir, "public", path);
      const file = Bun.file(filePath);
      
      if (await file.exists()) {
        const content = new Uint8Array(await file.arrayBuffer());
        const mtime = file.lastModified;
        const etag = `W/"${content.byteLength}-${mtime}"`;
        const lastModified = new Date(mtime).toUTCString();
        const contentType = file.type;
        
        const isCompressible = /\.(html|css|js|svg|json|map)$/.test(path);
        const gzip = isCompressible ? Bun.gzipSync(content) : null;
        
        entry = {
          content,
          gzip,
          etag,
          lastModified,
          contentType
        };
        cache.set(path, entry);
      }
    }
    
    if (entry) {
      // Check for conditional request
      if (
        req.headers.get("if-none-match") === entry.etag ||
        req.headers.get("if-modified-since") === entry.lastModified
      ) {
        return new Response(null, { status: 304 });
      }

      const headers = new Headers();
      headers.set("Content-Type", entry.contentType);
      headers.set("ETag", entry.etag);
      headers.set("Last-Modified", entry.lastModified);
      
      const shouldRevalidate = /\.(html|css|js|json|map)$/.test(path);
      
      if (shouldRevalidate) {
        headers.set("Cache-Control", "no-cache");
      } else {
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      }

      const acceptEncoding = req.headers.get("accept-encoding") || "";
      if (entry.gzip && acceptEncoding.includes("gzip")) {
        headers.set("Content-Encoding", "gzip");
        return new Response(entry.gzip as any, { headers });
      }

      return new Response(entry.content as any, { headers });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);