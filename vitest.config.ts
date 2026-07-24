import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@prism-lab/core": path.resolve(root, "packages/core/src/index.ts"),
      "@prism-lab/renderers": path.resolve(root, "packages/renderers/src/index.ts"),
      "@prism-lab/react": path.resolve(root, "packages/react/src/index.tsx"),
      "@prism-lab/recipes": path.resolve(root, "packages/recipes/src/index.tsx"),
    },
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
