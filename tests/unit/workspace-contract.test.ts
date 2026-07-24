import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readPackage(relativePath: string) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8")) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    private?: boolean;
    sideEffects?: boolean | string[];
  };
}

describe("workspace package contract", () => {
  it("keeps the optics core free of runtime dependencies", () => {
    const manifest = readPackage("packages/core/package.json");

    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.sideEffects).toBe(false);
  });

  it.each(["packages/react/package.json", "packages/recipes/package.json"])(
    "keeps React as a peer dependency in %s",
    (manifestPath) => {
      const manifest = readPackage(manifestPath);

      expect(manifest.peerDependencies?.react).toBe(">=18");
      expect(manifest.peerDependencies?.["react-dom"]).toBe(">=18");
      expect(manifest.dependencies?.react).toBeUndefined();
      expect(manifest.dependencies?.["react-dom"]).toBeUndefined();
    },
  );

  it("keeps all research packages private", () => {
    const paths = [
      "packages/core/package.json",
      "packages/renderers/package.json",
      "packages/react/package.json",
      "packages/recipes/package.json",
    ];

    for (const manifestPath of paths) {
      expect(readPackage(manifestPath).private).toBe(true);
    }
  });
});
