import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;

const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Alleen deze routes worden geprerenderd (zie scripts/prerender.mjs). Houd deze
// lijst in sync met ROUTES daar.
const PRERENDERED_ROUTES = new Set(["/", "/ai-accelerator", "/privacy"]);
const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";

// Wanneer de pagina is geprerenderd bevat #root al statische HTML: die
// hydrateren we in plaats van opnieuw te renderen. MAAR de Netlify SPA-fallback
// (`/* -> /index.html`) serveert de geprerenderde Landing-HTML óók voor élke
// niet-geprerenderde route (o.a. /portal/*, /dashboard). Zonder de padcheck
// zou hydrateRoot die Landing-DOM (SiteHeader + nav) proberen te matchen tegen
// een heel andere pagina -> hydration mismatch, waarbij de Landing-header als
// spookkopje over de echte pagina blijft liggen. Op zulke routes wissen we de
// fallback-HTML en renderen we client-side.
if (rootElement.hasChildNodes() && PRERENDERED_ROUTES.has(currentPath)) {
  hydrateRoot(rootElement, app);
} else {
  rootElement.innerHTML = "";
  createRoot(rootElement).render(app);
}
