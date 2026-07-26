import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readPackage(relativePath: string) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8")) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    private?: boolean;
    version?: string;
    license?: string;
    publishConfig?: { access?: string; provenance?: boolean };
    engines?: { node?: string };
    sideEffects?: boolean | string[];
    repository?: { url?: string };
    homepage?: string;
    bugs?: { url?: string };
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

  it.each([
    "packages/core/package.json",
    "packages/renderers/package.json",
    "packages/react/package.json",
    "packages/recipes/package.json",
  ])("keeps the build-time boundary %s unpublishable", (manifestPath) => {
    const manifest = readPackage(manifestPath);

    // These are compile-time boundaries whose code and declarations are inlined
    // into `open-glass-ui`. Publishing them would expose an import surface the
    // project does not support, so `private` is the guard against that.
    expect(manifest.private).toBe(true);
    expect(manifest.publishConfig).toBeUndefined();
  });

  it("publishes exactly one package, with no runtime dependencies", () => {
    const manifest = readPackage("packages/ui/package.json");

    expect(manifest.private).not.toBe(true);
    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.peerDependencies?.react).toBe(">=18");
    expect(manifest.peerDependencies?.["react-dom"]).toBe(">=18");
    expect(manifest.license).toBe("MIT");
    expect(manifest.publishConfig).toEqual({ access: "public", provenance: true });
    expect(manifest.engines?.node).toBe(">=18.18");
    expect(manifest.version).toBeTruthy();
  });

  it("declares the metadata npm and provenance attestation need", () => {
    const manifest = readPackage("packages/ui/package.json");

    expect(manifest.repository?.url).toMatch(/^git\+https:\/\/github\.com\/.+\.git$/);
    expect(manifest.homepage).toMatch(/^https:\/\//);
    expect(manifest.bugs?.url).toMatch(/^https:\/\//);
  });
});
