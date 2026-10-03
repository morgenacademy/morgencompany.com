// Prerendert de publieke marketing-routes naar statische HTML.
//
// Waarom: de app is een client-side React SPA. Crawlers die geen JS draaien
// (o.a. ahrefs) zien anders voor elke route dezelfde lege shell -> geen H1,
// identieke title/canonical -> "duplicate pages". Puppeteer draait de echte
// build in een headless browser en schrijft de gerenderde HTML (inclusief de
// door react-helmet-async gezette title/meta/canonical) terug naar dist, zodat
// die statisch wordt uitgeserveerd. main.tsx hydrateert die HTML client-side.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = 45678;

// Alleen publieke, indexeerbare routes. Auth-/app-routes hebben geen SEO-waarde.
const ROUTES = ["/", "/ai-accelerator", "/privacy"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Statische server met SPA-fallback: bestaat het bestand -> serveer het,
// anders -> index.html (zodat react-router de route afhandelt).
function startServer() {
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = join(DIST, urlPath);
    if (!extname(filePath) || !existsSync(filePath)) {
      filePath = join(DIST, "index.html");
    }
    try {
      const body = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function run() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      // Wacht tot React de content heeft gerenderd.
      await page.waitForSelector("#root h1", { timeout: 30000 });

      const html = await page.content();

      const outDir =
        route === "/" ? DIST : join(DIST, route.replace(/^\//, ""));
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "index.html"), html, "utf-8");
      await page.close();
      console.log(`prerendered ${route} -> ${join(outDir, "index.html")}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  // Prerender is een SEO-optimalisatie voor 3 marketing-routes. Het mag een
  // (productie-)deploy nooit blokkeren: valt puppeteer/Chromium weg, dan
  // waarschuwen we luid maar laten de build slagen (de SPA werkt sowieso).
  console.warn("prerender overgeslagen (niet-fataal):", err?.message ?? err);
  process.exit(0);
});
