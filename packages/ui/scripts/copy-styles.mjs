import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// The published stylesheet is the classic recipe layer followed by the liquid
// design layer. Order matters: liquid rules share the specificity of the
// classic rules they replace and win by coming later.
const sources = ["../../recipes/src/styles.css", "../../recipes/src/liquid.css"].map((path) =>
  fileURLToPath(new URL(path, import.meta.url)),
);
const destination = fileURLToPath(new URL("../dist/styles.css", import.meta.url));

const contents = await Promise.all(sources.map((source) => readFile(source, "utf8")));
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, contents.join("\n"));
