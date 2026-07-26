import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(root, "../..");
const llmsFiles = ["llms.txt", "llms-full.txt"] as const;

function llmsTextPlugin(): Plugin {
  return {
    name: "open-glass-ui-llms-text",
    buildStart() {
      for (const fileName of llmsFiles) {
        this.addWatchFile(path.join(repositoryRoot, fileName));
      }
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestPath = request.url?.split("?")[0];
        const fileName = llmsFiles.find((file) => requestPath === `/${file}`);

        if (!fileName || (request.method !== "GET" && request.method !== "HEAD")) {
          next();
          return;
        }

        try {
          const source = readFileSync(path.join(repositoryRoot, fileName), "utf8");
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.setHeader("Cache-Control", "no-cache");
          response.setHeader("X-Content-Type-Options", "nosniff");
          response.end(request.method === "HEAD" ? undefined : source);
        } catch (error) {
          next(error as Error);
        }
      });
    },
    generateBundle() {
      for (const fileName of llmsFiles) {
        this.emitFile({
          type: "asset",
          fileName,
          source: readFileSync(path.join(repositoryRoot, fileName), "utf8"),
        });
      }
    },
  };
}

/**
 * Crawlable routes, in the order a reader would meet them. Kept here rather
 * than in a checked-in public/sitemap.xml so the origin is configurable and the
 * file cannot drift from the real route table.
 */
const SITE_ROUTES = [
  { path: "/", priority: "1.0" },
  { path: "/components", priority: "0.9" },
  { path: "/docs", priority: "0.9" },
  { path: "/validation", priority: "0.6" },
  { path: "/research", priority: "0.6" },
  { path: "/library", priority: "0.5" },
  { path: "/library/hybrid", priority: "0.4" },
  { path: "/library/css", priority: "0.4" },
  { path: "/library/webgl", priority: "0.4" },
  { path: "/experiments/css", priority: "0.3" },
  { path: "/experiments/organic", priority: "0.3" },
  { path: "/experiments/sdf", priority: "0.3" },
  { path: "/experiments/webgl", priority: "0.3" },
  { path: "/experiments/hybrid", priority: "0.3" },
] as const;

function crawlFilesPlugin(siteUrl: string): Plugin {
  const origin = siteUrl.replace(/\/+$/, "");

  return {
    name: "open-glass-ui-crawl-files",
    transformIndexHtml(html) {
      // Canonical, og:url and og:image must be absolute, so the origin is
      // stamped in at build time rather than hardcoded in the document.
      return html.replaceAll("__SITE_URL__", origin);
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
      });

      const urls = SITE_ROUTES.map(
        ({ path: routePath, priority }) =>
          `  <url>\n    <loc>${origin}${routePath}</loc>\n    <priority>${priority}</priority>\n  </url>`,
      ).join("\n");

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}

const siteUrl = process.env.VITE_SITE_URL?.trim() || "https://openglass-ui.vercel.app";

export default defineConfig({
  plugins: [react(), llmsTextPlugin(), crawlFilesPlugin(siteUrl)],
  resolve: {
    alias: [
      {
        find: "@open-glass-ui/renderers/webgl",
        replacement: path.resolve(root, "../../packages/renderers/src/webgl.ts"),
      },
      {
        find: "@open-glass-ui/react/webgl",
        replacement: path.resolve(root, "../../packages/react/src/webgl.ts"),
      },
      {
        find: "@open-glass-ui/core",
        replacement: path.resolve(root, "../../packages/core/src/index.ts"),
      },
      {
        find: "@open-glass-ui/renderers",
        replacement: path.resolve(root, "../../packages/renderers/src/index.ts"),
      },
      {
        find: "@open-glass-ui/react",
        replacement: path.resolve(root, "../../packages/react/src/index.tsx"),
      },
      {
        find: "@open-glass-ui/recipes",
        replacement: path.resolve(root, "../../packages/recipes/src/index.tsx"),
      },
    ],
  },
  server: {
    port: 4173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
