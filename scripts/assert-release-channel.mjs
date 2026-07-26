import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const channel = process.argv[2];

assert.ok(
  channel === "rc" || channel === "stable",
  "Usage: node scripts/assert-release-channel.mjs <rc|stable>",
);

// `open-glass-ui` is the only published package, so it is the only version that
// has to line up with a release channel. The `@open-glass-ui/*` packages are
// private build-time boundaries; their version fields are never consumed.
const manifest = JSON.parse(readFileSync(join(root, "packages", "ui", "package.json"), "utf8"));

assert.notEqual(
  manifest.private,
  true,
  "open-glass-ui must stay publishable; a private package cannot be released.",
);

const { version } = manifest;
const prerelease = version.includes("-");

if (channel === "rc") {
  assert.ok(prerelease, `The next-tag release requires a prerelease version; found ${version}.`);
} else {
  assert.ok(!prerelease, `The latest-tag release requires a stable version; found ${version}.`);
}

console.log(`Release channel check passed: ${channel} -> ${version}`);
