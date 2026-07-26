import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const channel = process.argv[2];
const packageDirectories = ["core", "renderers", "react", "recipes", "ui"];

assert.ok(
  channel === "rc" || channel === "stable",
  "Usage: node scripts/assert-release-channel.mjs <rc|stable>",
);

const packages = packageDirectories.map((directory) => {
  const manifest = JSON.parse(
    readFileSync(join(root, "packages", directory, "package.json"), "utf8"),
  );
  return { name: manifest.name, version: manifest.version };
});
const versions = new Set(packages.map(({ version }) => version));

assert.equal(
  versions.size,
  1,
  `Release packages must share one version:\n${packages
    .map(({ name, version }) => `- ${name}: ${version}`)
    .join("\n")}`,
);

const [version] = versions;
const prerelease = version.includes("-");

if (channel === "rc") {
  assert.ok(prerelease, `The next-tag release requires a prerelease version; found ${version}.`);
} else {
  assert.ok(!prerelease, `The latest-tag release requires a stable version; found ${version}.`);
}

console.log(`Release channel check passed: ${channel} -> ${version}`);
