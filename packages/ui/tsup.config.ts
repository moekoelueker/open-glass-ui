import { defineConfig } from "tsup";

/**
 * `open-glass-ui` is the only published package. The `@open-glass-ui/*`
 * workspace packages are build-time boundaries, so both their runtime code and
 * their declarations are inlined here. Publishing them would expose an import
 * surface the project does not support.
 */
export default defineConfig({
  entry: ["src/index.tsx", "src/core.ts", "src/webgl.ts"],
  format: ["esm"],
  clean: true,
  splitting: true,
  // Rollup's treeshake pass drops module-level directives, which would strip the
  // "use client" boundary from index.js and webgl.js and break React Server
  // Components. esbuild already tree-shakes these entries.
  treeshake: false,
  external: ["react", "react-dom", "react/jsx-runtime"],
  noExternal: [/^@open-glass-ui\//],
  // `resolve: true` inlines the workspace declarations. React stays external, so
  // its types remain plain imports rather than being copied in.
  dts: { resolve: true },
});
