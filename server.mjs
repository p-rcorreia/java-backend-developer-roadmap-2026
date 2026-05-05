import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 8080);
const dataDir = process.env.DATA_DIR ?? path.join(__dirname, "data");
const progressFile = path.join(dataDir, "progress.json");
const publicDir = path.join(__dirname, "dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function handleApi(request, response) {
  if (request.url === "/api/health") {
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.url !== "/api/progress") return false;

  await mkdir(dataDir, { recursive: true });

  if (request.method === "GET") {
    try {
      const content = await readFile(progressFile, "utf8");
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(content);
    } catch {
      sendJson(response, 200, null);
    }
    return true;
  }

  if (request.method === "PUT") {
    try {
      const body = await readRequestBody(request);
      const parsed = JSON.parse(body);
      await writeFile(progressFile, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
      sendJson(response, 200, { ok: true });
    } catch {
      sendJson(response, 400, { ok: false, error: "Invalid progress JSON" });
    }
    return true;
  }

  sendJson(response, 405, { ok: false, error: "Method not allowed" });
  return true;
}

async function serveStatic(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(publicDir, safePath);

  try {
    const fileStat = await stat(requestedPath);
    if (fileStat.isFile()) {
      const ext = path.extname(requestedPath);
      response.writeHead(200, {
        "Content-Type": contentTypes[ext] ?? "application/octet-stream",
      });
      createReadStream(requestedPath).pipe(response);
      return;
    }
  } catch {
    // SPA fallback below.
  }

  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  createReadStream(path.join(publicDir, "index.html")).pipe(response);
}

createServer(async (request, response) => {
  try {
    if (await handleApi(request, response)) return;
    await serveStatic(request, response);
  } catch {
    sendJson(response, 500, { ok: false, error: "Internal server error" });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Roadmap app running on http://0.0.0.0:${port}`);
});
