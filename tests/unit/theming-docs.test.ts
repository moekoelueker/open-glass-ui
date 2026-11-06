import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The theming guidance in the docs and in llms-full.txt names tokens and
 * override routes that consumers copy. These tests hold those claims against
 * the stylesheets and the provider.
 */

const root = path.resolve(import.meta.dirname, "../..");
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

const guides = ["docs/THEMING.md", "llms-full.txt", "docs/AI-USAGE.md"] as const;
const liquidCss = read("packages/recipes/src/liquid.source.css");
const recipeCss = read("packages/recipes/src/styles.css");

/** The declarations of the first rule whose selector list starts with `selector`. */
function ruleBody(css: string, selector: string) {
  const start = css.indexOf(selector);
  expect(start, `no rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}

/** The custom properties one declaration of a rule body reads. */
function reads(body: string, property: string) {
  const declaration = body.match(new RegExp(`(?:^|;)\\s*${property}:([^;]*);`))?.[1] ?? "";
  return [...declaration.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1] as string);
}

describe("theming guidance", () => {
  it.each(guides)("does not offer the provider className for generated tokens in %s", (file) => {
    // The provider writes the semantic tokens inline; only `style` values are
    // merged into them, so a class on the same element always loses.
    const themeSource = read("packages/react/src/theme.tsx");
    expect(themeSource).toContain(
      "styleValues[name] === undefined ? value : String(styleValues[name])",
    );
    expect(read(file)).not.toMatch(/`style` \(or `className`\)/);
  });

  it.each(guides)("names only liquid tokens the stylesheet declares in %s", (file) => {
    const named = new Set(read(file).match(/--ogui-lg-[\w-]*[\w]/g) ?? []);
    for (const token of named) {
      expect(liquidCss, `${file} names ${token}`).toContain(`${token}:`);
    }
  });

  it.each(guides)("names the tokens liquid fields paint their well with in %s", (file) => {
    const body = ruleBody(liquidCss, ':where([data-ogui-design="liquid"]) .ogui-field > input,');
    const tokens = [...reads(body, "background"), ...reads(body, "box-shadow")];
    expect(tokens).toEqual(["--ogui-lg-well", "--ogui-lg-well-shadow"]);
    for (const token of tokens) {
      expect(read(file), `${file} omits ${token}`).toContain(token);
    }
  });

  it("documents that liquid text fields keep the control radius", () => {
    const classic = ruleBody(recipeCss, ":where(.ogui-field > input, .ogui-field > textarea,");
    expect(reads(classic, "border-radius")).toEqual(["--ogui-radius-control"]);
    // Liquid restyles the field well but leaves its corners alone.
    const liquid = ruleBody(liquidCss, ':where([data-ogui-design="liquid"]) .ogui-field > input,');
    expect(reads(liquid, "border-radius")).toEqual([]);

    const theming = read("docs/THEMING.md");
    const section = theming.slice(
      theming.indexOf("### Liquid control tokens"),
      theming.indexOf("## Semantic tokens"),
    );
    expect(
      section
        .split("\n")
        .some((line) => line.includes("`--ogui-radius-control`") && line.includes("`TextField`")),
    ).toBe(true);
  });
});
