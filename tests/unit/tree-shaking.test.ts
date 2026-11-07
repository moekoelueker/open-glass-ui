import path from "node:path";
import { build, type Plugin } from "esbuild";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Guards the per-component cost a consumer pays for one import from
 * `open-glass-ui`.
 *
 * The published `dist/index.js` is a single module that holds every recipe, so
 * a consumer's bundler can only drop what it can prove has no side effects. A
 * top-level `forwardRef(...)` call without a `@__PURE__` annotation counts as a
 * side effect and keeps that component, and everything it references, in every
 * bundle. 0.5.0 shipped eleven such calls and importing Button alone grew from
 * 17.8 KB to 28.7 KB.
 *
 * The test reproduces the published shape in two esbuild passes: the facade
 * bundled into one module the way tsup does, then a consumer bundle that
 * imports from it with the package's `sideEffects` setting. It runs from source
 * so it needs no prior build; `scripts/verify-packages.mjs` repeats the check
 * on the packed tarball.
 */

const root = path.resolve(import.meta.dirname, "../..");

const workspaceEntries: Record<string, string> = {
  "@open-glass-ui/core": "packages/core/src/index.ts",
  "@open-glass-ui/renderers": "packages/renderers/src/index.ts",
  "@open-glass-ui/renderers/webgl": "packages/renderers/src/webgl.ts",
  "@open-glass-ui/react": "packages/react/src/index.tsx",
  "@open-glass-ui/react/webgl": "packages/react/src/webgl.ts",
  "@open-glass-ui/recipes": "packages/recipes/src/index.tsx",
};

const external = ["react", "react-dom", "react/jsx-runtime"];

const workspaceSources: Plugin = {
  name: "workspace-sources",
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /^@open-glass-ui\// }, ({ path: specifier }) => {
      const entry = workspaceEntries[specifier];
      if (!entry) {
        throw new Error(`No workspace source mapped for ${specifier}.`);
      }
      return { path: path.join(root, entry) };
    });
  },
};

/** The facade as one module, built with the same esbuild settings tsup uses. */
async function bundleFacade() {
  const result = await build({
    absWorkingDir: root,
    bundle: true,
    entryPoints: [path.join(root, "packages/ui/src/index.tsx")],
    external,
    format: "esm",
    jsx: "automatic",
    loader: { ".css": "empty" },
    logLevel: "silent",
    platform: "neutral",
    plugins: [workspaceSources],
    write: false,
  });
  const [output] = result.outputFiles;
  if (!output) {
    throw new Error("The facade bundle produced no output.");
  }
  return output.text;
}

/** Bytes a consumer ships for `source`, minified, with React external. */
async function consumerBundle(facade: string, source: string) {
  const result = await build({
    bundle: true,
    external,
    format: "esm",
    logLevel: "silent",
    minify: true,
    platform: "browser",
    plugins: [
      {
        name: "published-facade",
        setup(pluginBuild) {
          pluginBuild.onResolve({ filter: /^open-glass-ui$/ }, () => ({
            namespace: "published-facade",
            path: "dist/index.js",
            // packages/ui/package.json declares only CSS as side-effectful.
            sideEffects: false,
          }));
          pluginBuild.onLoad({ filter: /.*/, namespace: "published-facade" }, () => ({
            contents: facade,
            loader: "js",
          }));
        },
      },
    ],
    stdin: { contents: source, loader: "js", resolveDir: root },
    write: false,
  });
  const [output] = result.outputFiles;
  if (!output) {
    throw new Error("The consumer bundle produced no output.");
  }
  return output.text;
}

/** Class names a bundle can render, a readable proxy for which recipes it kept. */
function recipeClassNames(code: string) {
  // The lookbehind skips `--ogui-*` custom properties, which are not classes.
  return [...new Set(code.match(/(?<![-\w])ogui-[\w-]+/g) ?? [])].sort();
}

describe("per-component tree-shaking of the published facade", () => {
  let barrelBytes = 0;
  let button = "";
  let badge = "";

  beforeAll(async () => {
    const facade = await bundleFacade();
    [barrelBytes, button, badge] = await Promise.all([
      consumerBundle(facade, 'export * from "open-glass-ui";').then((code) => code.length),
      consumerBundle(facade, 'export { Button } from "open-glass-ui";'),
      consumerBundle(facade, 'export { Badge } from "open-glass-ui";'),
    ]);
  });

  it("keeps Button alone to a small share of the barrel", () => {
    // A bare Button needs `forwardRef`, a class joiner and its markup. When
    // this guard was added it measured 2.1 KB, about 1.2 KB of which are the
    // facade's `import ... from "react"` statements; they only stay because
    // React is external here.
    expect(button.length, `Button alone is ${button.length} B`).toBeLessThan(3_000);
    expect(
      button.length / barrelBytes,
      `Button alone is ${button.length} B of the ${barrelBytes} B barrel`,
    ).toBeLessThan(0.05);
  });

  it("keeps every other recipe out of a Button-only bundle", () => {
    expect(recipeClassNames(button)).toEqual([
      "ogui-button",
      "ogui-button--",
      "ogui-button__icon",
      "ogui-button__label",
      "ogui-control--",
    ]);
  });

  it("keeps every forwardRef recipe out of a bundle of a plain function component", () => {
    expect(badge.length, `Badge alone is ${badge.length} B`).toBeLessThan(2_000);
    expect(recipeClassNames(badge)).toEqual(["ogui-badge"]);
  });
});
