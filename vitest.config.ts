import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@open-glass-ui/renderers/webgl",
        replacement: path.resolve(root, "packages/renderers/src/webgl.ts"),
      },
      {
        find: "@open-glass-ui/react/webgl",
        replacement: path.resolve(root, "packages/react/src/webgl.ts"),
      },
      {
        find: "@open-glass-ui/core",
        replacement: path.resolve(root, "packages/core/src/index.ts"),
      },
      {
        find: "@open-glass-ui/renderers",
        replacement: path.resolve(root, "packages/renderers/src/index.ts"),
      },
      {
        find: "@open-glass-ui/react",
        replacement: path.resolve(root, "packages/react/src/index.tsx"),
      },
      {
        find: "@open-glass-ui/recipes",
        replacement: path.resolve(root, "packages/recipes/src/index.tsx"),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
