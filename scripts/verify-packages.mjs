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
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const artifactsDirectory = join(root, "artifacts", "packages");
const temporaryDirectory = mkdtempSync(join(tmpdir(), "prism-package-check-"));
const installDirectory = join(temporaryDirectory, "consumer");
const extractionDirectory = join(temporaryDirectory, "extracted");
const packageNames = [
  "@prism-lab/core",
  "@prism-lab/renderers",
  "@prism-lab/react",
  "@prism-lab/recipes",
];

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

rmSync(artifactsDirectory, { force: true, recursive: true });
mkdirSync(artifactsDirectory, { recursive: true });
mkdirSync(installDirectory, { recursive: true });
mkdirSync(extractionDirectory, { recursive: true });

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
    const tarball = tarballs.find((file) => file.startsWith(slug));
    assert.ok(tarball, `Missing packed archive for ${packageName}.`);
    const tarballPath = join(artifactsDirectory, tarball);
    const packageExtraction = join(extractionDirectory, slug);
    mkdirSync(packageExtraction, { recursive: true });
    run("tar", ["-xzf", tarballPath, "-C", packageExtraction]);

    const manifest = JSON.parse(
      readFileSync(join(packageExtraction, "package", "package.json"), "utf8"),
    );
    const archiveFiles = run("tar", ["-tzf", tarballPath]).trim().split("\n");

    assert.equal(manifest.type, "module", `${packageName} must remain ESM.`);
    assert.ok(manifest.exports?.["."], `${packageName} must expose its root entry.`);
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
      sideEffects: manifest.sideEffects,
    };
  }

  const coreManifest = JSON.parse(readFileSync(join(root, "packages/core/package.json"), "utf8"));
  assert.equal(
    Object.keys(coreManifest.dependencies ?? {}).length,
    0,
    "The optics core must have zero runtime dependencies.",
  );

  for (const packageName of ["@prism-lab/react", "@prism-lab/recipes"]) {
    const packageDirectory = packageName.split("/").at(-1);
    const manifest = JSON.parse(
      readFileSync(join(root, "packages", packageDirectory, "package.json"), "utf8"),
    );
    assert.equal(manifest.peerDependencies?.react, ">=18");
    assert.equal(manifest.peerDependencies?.["react-dom"], ">=18");
  }

  const localTarballs = Object.fromEntries(
    packageNames.map((packageName) => {
      const slug = packageSlug(packageName);
      const archive = tarballs.find((file) => file.startsWith(slug));
      return [packageName, `file:${join(artifactsDirectory, archive)}`];
    }),
  );
  const consumerManifest = {
    name: "prism-packed-consumer",
    private: true,
    type: "module",
    dependencies: {
      ...localTarballs,
      react: `file:${realpathSync(join(root, "node_modules/react"))}`,
      "react-dom": `file:${realpathSync(join(root, "node_modules/react-dom"))}`,
    },
  };
  writeFileSync(
    join(installDirectory, "package.json"),
    `${JSON.stringify(consumerManifest, null, 2)}\n`,
  );
  run("npm", ["install", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund"], {
    cwd: installDirectory,
  });

  const smokeEntry = join(installDirectory, "smoke.mjs");
  writeFileSync(
    smokeEntry,
    `import { signedDistance } from "@prism-lab/core";
import { selectRenderer } from "@prism-lab/renderers";
import { Glass } from "@prism-lab/react";
import { Button } from "@prism-lab/recipes";

const distance = signedDistance({ x: 0, y: 0 }, {
  kind: "circle",
  centerX: 0,
  centerY: 0,
  radius: 12
});
if (!(distance < 0) || typeof selectRenderer !== "function" || !Glass || !Button) {
  throw new Error("Packed export smoke check failed.");
}
`,
  );
  run("node", [smokeEntry], { cwd: installDirectory });

  const treeShakeEntry = join(installDirectory, "tree-shake.mjs");
  const treeShakeOutput = join(installDirectory, "tree-shake.js");
  writeFileSync(
    treeShakeEntry,
    `import { signedDistance } from "@prism-lab/core";
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
    exportsSmoke: "passed",
    peerDependencies: "passed",
    coreRuntimeDependencies: 0,
    treeShaking: {
      entry: "signedDistance only",
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
