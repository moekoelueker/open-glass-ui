import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@prism-lab/core": path.resolve(root, "../../packages/core/src/index.ts"),
      "@prism-lab/renderers": path.resolve(root, "../../packages/renderers/src/index.ts"),
      "@prism-lab/react": path.resolve(root, "../../packages/react/src/index.tsx"),
      "@prism-lab/recipes": path.resolve(root, "../../packages/recipes/src/index.tsx"),
    },
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
