import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const artifactsDirectory = join(root, "artifacts", "packages");
const temporaryDirectory = mkdtempSync(join(tmpdir(), "ogui-package-check-"));
const installDirectory = join(temporaryDirectory, "consumer");
const react18InstallDirectory = join(temporaryDirectory, "consumer-react18");
const extractionDirectory = join(temporaryDirectory, "extracted");
const npmCacheDirectory = join(temporaryDirectory, "npm-cache");
const releaseVersion = JSON.parse(
  readFileSync(join(root, "packages", "ui", "package.json"), "utf8"),
).version;
const implementationPackageNames = [
  "@open-glass-ui/core",
  "@open-glass-ui/renderers",
  "@open-glass-ui/react",
  "@open-glass-ui/recipes",
];
const facadePackageName = "open-glass-ui";
const packageNames = [...implementationPackageNames, facadePackageName];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function packageSlug(name) {
  return name.replace("@", "").replace("/", "-");
}

function packageArchive(packageName, tarballs) {
  const expectedArchive = `${packageSlug(packageName)}-${releaseVersion}.tgz`;
  const archive = tarballs.find((file) => file === expectedArchive);
  assert.ok(archive, `Missing packed archive for ${packageName}: ${expectedArchive}.`);
  return archive;
}

rmSync(artifactsDirectory, { force: true, recursive: true });
mkdirSync(artifactsDirectory, { recursive: true });
mkdirSync(installDirectory, { recursive: true });
mkdirSync(react18InstallDirectory, { recursive: true });
mkdirSync(extractionDirectory, { recursive: true });
mkdirSync(npmCacheDirectory, { recursive: true });

try {
  for (const packageName of packageNames) {
    run("pnpm", ["--filter", packageName, "pack", "--pack-destination", artifactsDirectory]);
  }

  const tarballs = readdirSync(artifactsDirectory)
    .filter((file) => file.endsWith(".tgz"))
    .sort();
  assert.equal(
    tarballs.length,
    packageNames.length,
    "Every library package must produce a tarball.",
  );

  const packed = {};
  for (const packageName of packageNames) {
    const slug = packageSlug(packageName);
    const tarball = packageArchive(packageName, tarballs);
    const tarballPath = join(artifactsDirectory, tarball);
    const packageExtraction = join(extractionDirectory, slug);
    mkdirSync(packageExtraction, { recursive: true });
    run("tar", ["-xzf", tarballPath, "-C", packageExtraction]);

    const manifest = JSON.parse(
      readFileSync(join(packageExtraction, "package", "package.json"), "utf8"),
    );
    const archiveFiles = run("tar", ["-tzf", tarballPath]).trim().split("\n");

    assert.equal(manifest.name, packageName, "Packed package name must match its workspace.");
    assert.equal(manifest.version, releaseVersion, `${packageName} must use the release version.`);
    assert.notEqual(manifest.private, true, `${packageName} cannot be private.`);
    assert.equal(manifest.type, "module", `${packageName} must remain ESM.`);
    assert.equal(manifest.license, "MIT", `${packageName} must declare the MIT license.`);
    assert.equal(manifest.author, "Moe Luker", `${packageName} must declare its author.`);
    assert.ok(manifest.description?.length > 24, `${packageName} needs a useful description.`);
    assert.equal(
      manifest.publishConfig?.access,
      "public",
      `${packageName} must be publicly publishable.`,
    );
    assert.equal(
      manifest.publishConfig?.provenance,
      true,
      `${packageName} must request npm provenance.`,
    );
    assert.equal(manifest.engines?.node, ">=18.18", `${packageName} must declare Node support.`);
    assert.ok(manifest.keywords?.length >= 5, `${packageName} needs discoverability keywords.`);
    assert.ok(manifest.exports?.["."], `${packageName} must expose its root entry.`);
    assert.ok(manifest.exports?.["./package.json"], `${packageName} must expose package metadata.`);
    assert.ok(
      archiveFiles.includes("package/dist/index.js"),
      `${packageName} archive is missing JavaScript output.`,
    );
    assert.ok(
      archiveFiles.includes("package/dist/index.d.ts"),
      `${packageName} archive is missing declarations.`,
    );
    assert.ok(
      archiveFiles.includes("package/LICENSE"),
      `${packageName} archive is missing the license.`,
    );

    const packageDirectory =
      packageName === facadePackageName ? "ui" : packageName.split("/").at(-1);
    const npmDryRun = JSON.parse(
      run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
        cwd: join(root, "packages", packageDirectory),
        env: {
          ...process.env,
          npm_config_cache: npmCacheDirectory,
        },
      }),
    )[0];
    const npmDryRunFiles = new Set(npmDryRun.files.map(({ path }) => path));
    for (const requiredFile of ["LICENSE", "README.md", "dist/index.js", "dist/index.d.ts"]) {
      assert.ok(
        npmDryRunFiles.has(requiredFile),
        `${packageName} npm pack dry run is missing ${requiredFile}.`,
      );
    }

    for (const version of Object.values(manifest.dependencies ?? {})) {
      assert.ok(
        !String(version).startsWith("workspace:"),
        "Packed manifests cannot leak workspace:",
      );
    }

    packed[packageName] = {
      archive: relative(root, tarballPath),
      bytes: statSync(tarballPath).size,
      files: archiveFiles.length,
      npmDryRunFiles: npmDryRunFiles.size,
      sideEffects: manifest.sideEffects,
    };
  }

  const extractedManifest = (packageName) => {
    const slug = packageSlug(packageName);
    return JSON.parse(
      readFileSync(join(extractionDirectory, slug, "package", "package.json"), "utf8"),
    );
  };

  const coreManifest = JSON.parse(readFileSync(join(root, "packages/core/package.json"), "utf8"));
  assert.equal(
    Object.keys(coreManifest.dependencies ?? {}).length,
    0,
    "The optics core must have zero runtime dependencies.",
  );

  for (const packageName of ["@open-glass-ui/react", "@open-glass-ui/recipes"]) {
    const packageDirectory = packageName.split("/").at(-1);
    const manifest = JSON.parse(
      readFileSync(join(root, "packages", packageDirectory, "package.json"), "utf8"),
    );
    assert.equal(manifest.peerDependencies?.react, ">=18");
    assert.equal(manifest.peerDependencies?.["react-dom"], ">=18");
  }

  const facadeManifest = extractedManifest(facadePackageName);
  assert.deepEqual(
    Object.keys(facadeManifest.dependencies ?? {}).sort(),
    [...implementationPackageNames].sort(),
    "The facade must depend on every implementation package and nothing else.",
  );
  for (const packageName of implementationPackageNames) {
    assert.equal(
      facadeManifest.dependencies?.[packageName],
      releaseVersion,
      `The packed facade must pin ${packageName} to the coordinated release.`,
    );
  }
  assert.equal(facadeManifest.peerDependencies?.react, ">=18");
  assert.equal(facadeManifest.peerDependencies?.["react-dom"], ">=18");
  assert.ok(facadeManifest.exports?.["./webgl"], "The facade must expose opt-in WebGL.");
  assert.ok(facadeManifest.exports?.["./core"], "The facade must expose a server-safe core entry.");
  assert.equal(
    facadeManifest.exports?.["./styles.css"],
    "./dist/styles.css",
    "The facade must expose its recipe stylesheet.",
  );
  assert.ok(
    facadeManifest.sideEffects?.includes("**/*.css"),
    "The facade must preserve stylesheet imports.",
  );
  const facadeArchive = packageArchive(facadePackageName, tarballs);
  const facadeArchiveFiles = run("tar", ["-tzf", join(artifactsDirectory, facadeArchive)])
    .trim()
    .split("\n");
  assert.ok(
    facadeArchiveFiles.includes("package/dist/styles.css"),
    "The facade archive is missing recipe styles.",
  );
  assert.ok(
    facadeArchiveFiles.includes("package/dist/webgl.js"),
    "The facade archive is missing the opt-in WebGL entry.",
  );
  assert.ok(
    facadeArchiveFiles.includes("package/dist/core.js"),
    "The facade archive is missing the server-safe core entry.",
  );
  assert.ok(
    facadeArchiveFiles.includes("package/README.md"),
    "The facade archive is missing its package README.",
  );

  const packedSource = (packageName, file) =>
    readFileSync(
      join(extractionDirectory, packageSlug(packageName), "package", "dist", file),
      "utf8",
    );
  for (const [packageName, file] of [
    [facadePackageName, "index.js"],
    [facadePackageName, "webgl.js"],
    ["@open-glass-ui/react", "index.js"],
    ["@open-glass-ui/react", "webgl.js"],
    ["@open-glass-ui/recipes", "index.js"],
  ]) {
    assert.match(
      packedSource(packageName, file),
      /^["']use client["'];/,
      `${packageName}/dist/${file} must preserve its React client boundary.`,
    );
  }
  const facadeCoreSource = packedSource(facadePackageName, "core.js");
  assert.doesNotMatch(
    facadeCoreSource,
    /^["']use client["'];/,
    "The facade core subpath cannot be marked as a client boundary.",
  );
  assert.doesNotMatch(
    facadeCoreSource,
    /(?:from|require\()\s*["']react(?:\/[^"']*)?["']/,
    "The facade core subpath cannot import React.",
  );

  const localTarballs = Object.fromEntries(
    packageNames.map((packageName) => {
      const archive = packageArchive(packageName, tarballs);
      return [packageName, `file:${join(artifactsDirectory, archive)}`];
    }),
  );
  const reactDomDirectory = realpathSync(join(root, "node_modules/react-dom"));
  const requireFromReactDom = createRequire(join(reactDomDirectory, "package.json"));
  const schedulerDirectory = realpathSync(
    dirname(requireFromReactDom.resolve("scheduler/package.json")),
  );
  const consumerManifest = {
    name: "ogui-packed-consumer",
    private: true,
    type: "module",
    dependencies: {
      [facadePackageName]: localTarballs[facadePackageName],
      react: `file:${realpathSync(join(root, "node_modules/react"))}`,
      "react-dom": `file:${reactDomDirectory}`,
      scheduler: `file:${schedulerDirectory}`,
    },
    overrides: Object.fromEntries(
      implementationPackageNames.map((packageName) => [packageName, localTarballs[packageName]]),
    ),
  };
  writeFileSync(
    join(installDirectory, "package.json"),
    `${JSON.stringify(consumerManifest, null, 2)}\n`,
  );
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--offline"], {
    cwd: installDirectory,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDirectory,
    },
  });

  const smokeEntry = join(installDirectory, "smoke.mjs");
  writeFileSync(
    smokeEntry,
    `import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  Button,
  Glass,
  GlassSystemProvider,
  signedDistance
} from "open-glass-ui";
import {
  WebGLGlassRenderer,
  WebGLGlassSurface
} from "open-glass-ui/webgl";

const distance = signedDistance({ x: 0, y: 0 }, {
  kind: "circle",
  centerX: 0,
  centerY: 0,
  radius: 12
});
const stylesheet = await readFile(
  fileURLToPath(import.meta.resolve("open-glass-ui/styles.css")),
  "utf8"
);
if (
  !(distance < 0) ||
  typeof WebGLGlassRenderer !== "function" ||
  !Glass ||
  !Button ||
  !GlassSystemProvider ||
  !WebGLGlassSurface ||
  !stylesheet.includes(".ogui-button")
) {
  throw new Error("Packed export smoke check failed.");
}
`,
  );
  run("node", [smokeEntry], { cwd: installDirectory });

  const serverSmokeEntry = join(installDirectory, "server-smoke.mjs");
  writeFileSync(
    serverSmokeEntry,
    `import { signedDistance } from "open-glass-ui/core";
const distance = signedDistance({ x: 0, y: 0 }, {
  kind: "circle",
  centerX: 0,
  centerY: 0,
  radius: 12
});
if (!(distance < 0)) {
  throw new Error("Server-safe core export smoke check failed.");
}
`,
  );
  run("node", ["--conditions=react-server", serverSmokeEntry], { cwd: installDirectory });

  const react18FixtureModules = join(root, "examples", "react18", "node_modules");
  const react18Directory = realpathSync(join(react18FixtureModules, "react"));
  const reactDom18Directory = realpathSync(join(react18FixtureModules, "react-dom"));
  const reactTypes18Directory = realpathSync(join(react18FixtureModules, "@types", "react"));
  const reactDomTypes18Directory = realpathSync(join(react18FixtureModules, "@types", "react-dom"));
  const requireFromReactDom18 = createRequire(join(reactDom18Directory, "package.json"));
  const requireFromReactTypes18 = createRequire(join(reactTypes18Directory, "package.json"));
  const scheduler18Directory = realpathSync(
    dirname(requireFromReactDom18.resolve("scheduler/package.json")),
  );
  const propTypes18Directory = realpathSync(
    dirname(requireFromReactTypes18.resolve("@types/prop-types/package.json")),
  );
  const cssTypeDirectory = realpathSync(
    dirname(requireFromReactTypes18.resolve("csstype/package.json")),
  );
  const react18Manifest = {
    ...consumerManifest,
    name: "ogui-packed-consumer-react18",
    dependencies: {
      [facadePackageName]: localTarballs[facadePackageName],
      react: `file:${react18Directory}`,
      "react-dom": `file:${reactDom18Directory}`,
      scheduler: `file:${scheduler18Directory}`,
      "@types/react": `file:${reactTypes18Directory}`,
      "@types/react-dom": `file:${reactDomTypes18Directory}`,
      "@types/prop-types": `file:${propTypes18Directory}`,
      csstype: `file:${cssTypeDirectory}`,
    },
  };
  writeFileSync(
    join(react18InstallDirectory, "package.json"),
    `${JSON.stringify(react18Manifest, null, 2)}\n`,
  );
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--offline"], {
    cwd: react18InstallDirectory,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDirectory,
    },
  });
  const react18SmokeEntry = join(react18InstallDirectory, "react18-smoke.mjs");
  writeFileSync(
    react18SmokeEntry,
    `import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";

const html = renderToString(
  createElement(
    GlassSystemProvider,
    { theme: { appearance: "dark" } },
    createElement(Glass, { material: "regular" }, createElement(Button, null, "Continue"))
  )
);
if (!html.includes("Continue") || !html.includes("data-ogui-theme")) {
  throw new Error("React 18 facade render smoke check failed.");
}
`,
  );
  run("node", [react18SmokeEntry], { cwd: react18InstallDirectory });

  const react18TypeEntry = join(react18InstallDirectory, "react18-types.tsx");
  writeFileSync(
    react18TypeEntry,
    `import {
  Button,
  Glass,
  GlassSystemProvider,
  type GlassSystemProviderProps
} from "open-glass-ui";

const theme: GlassSystemProviderProps["theme"] = {
  appearance: "dark",
  theme: { preset: "neutral" }
};

export const probe = (
  <GlassSystemProvider theme={theme}>
    <Glass material="regular">
      <Button variant="primary">Continue</Button>
    </Glass>
  </GlassSystemProvider>
);
`,
  );
  const react18TypeConfig = join(react18InstallDirectory, "tsconfig.json");
  writeFileSync(
    react18TypeConfig,
    `${JSON.stringify(
      {
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
          types: ["react", "react-dom"],
        },
        include: ["react18-types.tsx"],
      },
      null,
      2,
    )}\n`,
  );
  run(join(root, "node_modules", ".bin", "tsc"), ["--project", react18TypeConfig], {
    cwd: react18InstallDirectory,
  });

  const facadeEntry = join(installDirectory, "facade-entry.mjs");
  const facadeOutput = join(installDirectory, "facade-entry.js");
  writeFileSync(
    facadeEntry,
    `import { Button, Glass, GlassSystemProvider } from "open-glass-ui";
console.log(Button, Glass, GlassSystemProvider);
`,
  );
  const facadeBundle = await build({
    absWorkingDir: installDirectory,
    bundle: true,
    entryPoints: [facadeEntry],
    external: ["react", "react-dom", "react/jsx-runtime"],
    format: "esm",
    logLevel: "silent",
    metafile: true,
    minify: true,
    outfile: facadeOutput,
    platform: "browser",
    treeShaking: true,
  });
  const facadeBundleSource = readFileSync(facadeOutput, "utf8");
  const facadeBundleInputs = Object.keys(facadeBundle.metafile.inputs);
  const eagerWebGLInputs = facadeBundleInputs.filter((input) =>
    /(?:^|[/\\])webgl(?:[-./\\]|$)/i.test(input),
  );
  assert.deepEqual(
    eagerWebGLInputs,
    [],
    `The root facade eagerly included WebGL inputs: ${eagerWebGLInputs.join(", ")}`,
  );
  assert.ok(
    !facadeBundleSource.includes("#version 300 es") &&
      !facadeBundleSource.includes("webglcontextlost") &&
      !facadeBundleSource.includes("WebGLGlassRenderer"),
    "The root facade bundle contains opt-in WebGL implementation code.",
  );

  const webglEntry = join(installDirectory, "webgl-entry.mjs");
  const webglOutput = join(installDirectory, "webgl-entry.js");
  writeFileSync(
    webglEntry,
    `import { WebGLGlassRenderer, WebGLGlassSurface } from "open-glass-ui/webgl";
console.log(WebGLGlassRenderer, WebGLGlassSurface);
`,
  );
  const webglBundle = await build({
    absWorkingDir: installDirectory,
    bundle: true,
    entryPoints: [webglEntry],
    external: ["react", "react-dom", "react/jsx-runtime"],
    format: "esm",
    logLevel: "silent",
    metafile: true,
    minify: true,
    outfile: webglOutput,
    platform: "browser",
    treeShaking: true,
  });
  const webglBundleSource = readFileSync(webglOutput, "utf8");
  assert.ok(
    webglBundleSource.includes("#version 300 es") || webglBundleSource.includes("webglcontextlost"),
    "The WebGL subpath bundle did not include the WebGL implementation.",
  );

  const treeShakeEntry = join(installDirectory, "tree-shake.mjs");
  const treeShakeOutput = join(installDirectory, "tree-shake.js");
  writeFileSync(
    treeShakeEntry,
    `import { signedDistance } from "open-glass-ui";
console.log(signedDistance({ x: 0, y: 0 }, {
  kind: "circle",
  centerX: 0,
  centerY: 0,
  radius: 10
}));
`,
  );
  const bundle = await build({
    absWorkingDir: installDirectory,
    bundle: true,
    entryPoints: [treeShakeEntry],
    format: "esm",
    logLevel: "silent",
    metafile: true,
    minify: true,
    outfile: treeShakeOutput,
    platform: "browser",
    treeShaking: true,
    external: ["react", "react-dom", "react/jsx-runtime"],
  });
  const treeShakenBytes = statSync(treeShakeOutput).size;
  assert.ok(
    treeShakenBytes < 2_000,
    `Core tree-shaken probe is unexpectedly ${treeShakenBytes} B.`,
  );

  const report = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    packages: packed,
    packedInstall: "passed",
    facadeExportsSmoke: "passed",
    facadeStyles: "passed",
    peerDependencies: "passed",
    react18Compatibility: "passed",
    react18Types: "passed",
    coreRuntimeDependencies: 0,
    webglIsolation: {
      rootFacadeBytes: statSync(facadeOutput).size,
      rootFacadeInputs: facadeBundleInputs.length,
      eagerWebGLInputs: eagerWebGLInputs.length,
      webglSubpathBytes: statSync(webglOutput).size,
      webglSubpathInputs: Object.keys(webglBundle.metafile.inputs).length,
      status: "passed",
    },
    treeShaking: {
      entry: "signedDistance from public facade",
      bytes: treeShakenBytes,
      inputCount: Object.keys(bundle.metafile.inputs).length,
      status: "passed",
    },
  };
  writeFileSync(
    join(artifactsDirectory, "package-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
