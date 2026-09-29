#!/usr/bin/env node
/**
 * Derives packages/ui/README.md (what npmjs.com shows) from the root README.
 *
 * npm renders the package README outside the repository, so relative links and
 * images must become absolute GitHub URLs. The contributor-only sections are
 * replaced with a short pointer. Usage: node scripts/sync-package-readme.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const REPO = "https://github.com/moekoelueker/open-glass-ui";
const RAW = "https://raw.githubusercontent.com/moekoelueker/open-glass-ui/main/";
const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

export function packageReadme(source) {
  let text = source
    .replaceAll("./docs/media/", `${RAW}docs/media/`)
    .replace(/\]\(\.\//g, `](${REPO}/blob/main/`)
    .replace(/href="\.\//g, `href="${REPO}/blob/main/`);
  const contributing = text.indexOf("## Contributing");
  if (contributing >= 0) {
    text = `${text.slice(0, contributing)}## Contributing

Issues and pull requests are welcome. Start with the
[contributing guide](${REPO}/blob/main/CONTRIBUTING.md).

## License

[MIT](${REPO}/blob/main/LICENSE).
`;
  }
  return text;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const generated = packageReadme(readFileSync(root("README.md"), "utf8"));
  const target = root("packages/ui/README.md");
  if (process.argv.includes("--check")) {
    if (readFileSync(target, "utf8") !== generated) {
      console.error("packages/ui/README.md is stale. Run `pnpm sync:readme`.");
      process.exit(1);
    }
    console.log("packages/ui/README.md is up to date.");
  } else {
    writeFileSync(target, generated);
    console.log("Wrote packages/ui/README.md");
  }
}
