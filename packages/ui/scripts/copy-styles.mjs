import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../../recipes/src/styles.css", import.meta.url));
const destination = fileURLToPath(new URL("../dist/styles.css", import.meta.url));

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
