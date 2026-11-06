import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as facade from "../../packages/ui/src/index";

/**
 * llms-full.txt is the version-matched reference agents use to write consumer
 * code. These tests keep its component reference from drifting away from the
 * real exports and props interfaces.
 */

const root = path.resolve(import.meta.dirname, "../..");
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

const llmsFull = read("llms-full.txt");
const llms = read("llms.txt");

const recipeSources = ["packages/recipes/src/index.tsx", "packages/recipes/src/atlas.tsx"].map(
  read,
);
const reactSources = readdirSync(path.join(root, "packages/react/src"))
  .filter((file) => /\.tsx?$/.test(file) && !file.includes(".test."))
  .map((file) => read(`packages/react/src/${file}`));
const allSource = [...recipeSources, ...reactSources].join("\n");

const FORTY_RECIPES = [
  "Button",
  "IconButton",
  "SegmentedControl",
  "Switch",
  "Slider",
  "Toolbar",
  "Dock",
  "Tabs",
  "Menu",
  "MenuItem",
  "Popover",
  "Tooltip",
  "MediaControls",
  "Badge",
  "Avatar",
  "AvatarGroup",
  "Card",
  "Stat",
  "Progress",
  "Meter",
  "Spinner",
  "Skeleton",
  "Alert",
  "Banner",
  "Breadcrumbs",
  "Pagination",
  "Accordion",
  "Dialog",
  "Drawer",
  "Toast",
  "Checkbox",
  "RadioGroup",
  "Select",
  "TextField",
  "Textarea",
  "SearchField",
  "NumberField",
  "Stepper",
  "ToggleButton",
  "FileDropzone",
];

// Native React event handlers that recipes forward from the element they wrap.
const NATIVE_HANDLERS = new Set([
  "onBlur",
  "onChange",
  "onClick",
  "onInput",
  "onPointerMove",
  "onFocus",
  "onKeyDown",
]);

function backticked(text: string): string[] {
  return [...text.matchAll(/`([A-Za-z][\w-]*)`/g)].map((match) => match[1] as string);
}

function sectionBody(heading: RegExp): string {
  const start = llmsFull.search(heading);
  expect(start, `llms-full.txt is missing a section matching ${heading}`).toBeGreaterThanOrEqual(0);
  const rest = llmsFull.slice(start + 1);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

interface ReferenceEntry {
  name: string;
  interfaceName: string | null;
  required: string[];
  callbacks: string[];
}

function parseReference(): ReferenceEntry[] {
  const body = sectionBody(/\n## \d+\. Component reference/);
  return body
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const name = chunk.split("\n")[0]?.trim() ?? "";
      const interfaceLine = /^Interface: (.+)$/m.exec(chunk)?.[1] ?? "";
      const interfaceToken = /`([A-Za-z]\w*)(?:<[^`]*>)?`/.exec(interfaceLine)?.[1] ?? null;
      const required = /^Required: (.+)$/m.exec(chunk)?.[1] ?? "none";
      const callbacks = /^Callbacks: (.+)$/m.exec(chunk)?.[1] ?? "";
      return {
        name,
        interfaceName: interfaceToken,
        required: required.trim() === "none" ? [] : backticked(required),
        callbacks: backticked(callbacks),
      };
    });
}

/** Text of `interface name { ... }`, or null. Braces inside the body are balanced. */
function interfaceDeclaration(name: string): { header: string; body: string } | null {
  for (const source of recipeSources) {
    const match = new RegExp(`(?:export )?interface ${name}\\b([^{]*)\\{`).exec(source);
    if (!match) {
      continue;
    }
    let depth = 1;
    let index = match.index + match[0].length;
    const bodyStart = index;
    while (depth > 0 && index < source.length) {
      const character = source[index];
      depth += character === "{" ? 1 : character === "}" ? -1 : 0;
      index += 1;
    }
    return { header: match[1] ?? "", body: source.slice(bodyStart, index - 1) };
  }
  return null;
}

/** The interface body plus the bodies of any local interfaces it extends. */
function propsText(name: string, seen = new Set<string>()): string {
  if (seen.has(name)) {
    return "";
  }
  seen.add(name);
  const declaration = interfaceDeclaration(name);
  if (!declaration) {
    return "";
  }
  const parents = [...declaration.header.matchAll(/\b([A-Z]\w*)\b/g)].map((match) => match[1]);
  return [declaration.body, ...parents.map((parent) => propsText(parent as string, seen))].join(
    "\n",
  );
}

function functionSource(name: string): string {
  const start = recipeSources
    .map((source) => ({ source, index: source.indexOf(`export function ${name}`) }))
    .find((candidate) => candidate.index >= 0);
  expect(start, `export function ${name} was not found in the recipe sources`).toBeDefined();
  const { source, index } = start as { source: string; index: number };
  const rest = source.slice(index + 1);
  const next = rest.search(/\nexport /);
  return next === -1 ? rest : rest.slice(0, next);
}

/** Names of required (non-optional) members declared at the top level of an interface body. */
function requiredMembers(text: string): string[] {
  let depth = 0;
  let topLevel = "";
  for (const character of text) {
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
    } else if (depth === 0) {
      topLevel += character;
    }
  }
  return [...topLevel.matchAll(/^\s*"?([\w-]+)"?:/gm)].map((match) => match[1] as string);
}

const declaresProp = (text: string, prop: string) =>
  new RegExp(`^\\s*"?${prop}"?\\??:`, "m").test(text);
const declaresRequiredProp = (text: string, prop: string) =>
  new RegExp(`^\\s*"?${prop}"?:`, "m").test(text);

describe("llms-full.txt component reference", () => {
  const entries = parseReference();

  it("documents exactly the forty recipes", () => {
    expect(entries.map((entry) => entry.name).sort()).toEqual([...FORTY_RECIPES].sort());
  });

  it.each(entries.map((entry) => [entry.name, entry] as const))(
    "%s is a runtime export and its props match the source",
    (name, entry) => {
      const exported = (facade as Record<string, unknown>)[name];
      expect(exported, `${name} must be exported from open-glass-ui`).toBeDefined();
      expect(["function", "object"]).toContain(typeof exported);

      if (entry.interfaceName === null) {
        // Props are declared inline on the function signature.
        const source = functionSource(name);
        for (const prop of [...entry.required, ...entry.callbacks]) {
          expect(source, `${name} documents ${prop}, which its signature does not mention`).toMatch(
            new RegExp(`\\b${prop}\\b`),
          );
        }
        return;
      }

      const declared = propsText(entry.interfaceName);
      expect(declared, `interface ${entry.interfaceName} was not found`).not.toBe("");
      for (const prop of entry.required) {
        expect(
          declaresRequiredProp(declared, prop),
          `${name}: documented required prop ${prop} is not a required member of ${entry.interfaceName}`,
        ).toBe(true);
      }
      for (const prop of requiredMembers(declared)) {
        expect(
          entry.required,
          `${name}: ${entry.interfaceName} requires ${prop}, but llms-full.txt does not list it`,
        ).toContain(prop);
      }
      for (const callback of entry.callbacks) {
        expect(
          declaresProp(declared, callback),
          `${name}: documented callback ${callback} is not declared by ${entry.interfaceName}`,
        ).toBe(true);
      }
    },
  );

  it("names only callbacks that exist in the sources or are native handlers", () => {
    const mentioned = new Set(llmsFull.match(/\bon[A-Z]\w*/g) ?? []);
    expect(mentioned.size).toBeGreaterThan(10);
    for (const handler of mentioned) {
      const known = NATIVE_HANDLERS.has(handler) || allSource.includes(handler);
      expect(
        known,
        `${handler} is mentioned in llms-full.txt but exists nowhere in the sources`,
      ).toBe(true);
    }
  });

  it("lists only exports that exist", () => {
    const names = [...llmsFull.matchAll(/^Exports: ([\s\S]*?)(?=\n\n)/gm)].flatMap((match) =>
      backticked(match[1] as string),
    );
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      expect(
        (facade as Record<string, unknown>)[name],
        `${name} must be exported from open-glass-ui`,
      ).toBeDefined();
    }
  });
});

describe("llms reference hygiene", () => {
  it.each([
    ["llms.txt", llms],
    ["llms-full.txt", llmsFull],
  ])("%s describes the published package without private or stale wording", (_name, text) => {
    expect(text).not.toMatch(/pre-release/i);
    expect(text).not.toContain("local-workspace");
    expect(text).not.toContain("/Users/");
    expect(text).not.toContain("—");
    expect(text).toContain("open-glass-ui");
  });

  it("links to documentation with absolute URLs only", () => {
    expect(llms).not.toMatch(/\]\((?!https?:)/);
    expect(llms).toContain("https://github.com/moekoelueker/open-glass-ui/blob/main/");
  });

  it("states the cascade-layer recipe for Tailwind CSS v4", () => {
    for (const text of [llmsFull, read("README.md"), read("docs/THEMING.md")]) {
      expect(text).toContain("@layer theme, base, ogui, components, utilities;");
      expect(text).toContain('@import "open-glass-ui/styles.css" layer(ogui);');
    }
  });
});
