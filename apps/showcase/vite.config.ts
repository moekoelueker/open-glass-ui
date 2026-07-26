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

export default defineConfig({
  plugins: [react(), llmsTextPlugin()],
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
