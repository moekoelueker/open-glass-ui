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
    // The suite finishes in a few seconds on an idle machine, but the
    // property-based optics and displacement-map tests do real per-pixel work.
    // Under load (a shared CI runner, or a local box also running the browser
    // suite) they exceed the 5s default and fail as timeouts rather than for
    // any behavioral reason. A generous ceiling removes that false signal
    // without weakening any assertion.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
