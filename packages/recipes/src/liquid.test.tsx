// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GlassProvider } from "@open-glass-ui/react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import {
  GUARD_DEPTH,
  generateLiquidCss,
  LIQUID_GUARD,
} from "../../../scripts/generate-liquid-css.mjs";
import { Button, Menu, MenuItem, SegmentedControl, Slider, Tabs } from "./index";

afterEach(cleanup);

const read = (name: string) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");

interface CssRule {
  /** Enclosing at-rule preludes, outermost first, joined by a space. */
  at: string;
  selectors: string[];
  body: string;
}

function splitSelectorList(prelude: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of prelude) {
    if (character === "(" || character === "[") depth += 1;
    if (character === ")" || character === "]") depth -= 1;
    if (character === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  parts.push(current.trim());
  return parts;
}

/** Style rules of a flat stylesheet (at-rules one level deep, keyframes skipped). */
function collectRules(css: string): CssRule[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  const stack: string[] = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "{") {
      stack.push(text.slice(start, index).trim());
      start = index + 1;
    } else if (character === "}") {
      const prelude = stack.pop() ?? "";
      const at = stack.join(" ");
      if (!prelude.startsWith("@") && !at.includes("@keyframes")) {
        const selectors = splitSelectorList(prelude).map((selector) =>
          selector.replace(/\s+/g, " "),
        );
        rules.push({ at, selectors, body: text.slice(start, index) });
      }
      start = index + 1;
    }
  }
  return rules;
}

const liquidRules = collectRules(read("./liquid.css"));

describe("liquid stylesheet", () => {
  it("is generated from the current source", () => {
    expect(read("./liquid.css")).toBe(generateLiquidCss(read("./liquid.source.css")));
  });

  it("keeps the classic stylesheet free of liquid rules", () => {
    expect(read("./styles.css")).not.toContain("data-ogui-design");
  });

  it("only inserts the guard, so every rule keeps its source selector", () => {
    const normalize = (css: string) => css.replace(/\s+/g, " ").replace(/\s*\{\s*/g, "{");
    const header = read("./liquid.css").split("\n", 1)[0];
    expect(normalize(read("./liquid.css").replaceAll(LIQUID_GUARD, ""))).toBe(
      normalize(`${header}\n${read("./liquid.source.css")}`),
    );
  });
});

type Design = "liquid" | "classic";

const SCOPE = ':where([data-ogui-design="liquid"])';
const scopeChain = (designs: readonly Design[]) =>
  designs.map((design) => `[data-ogui-design="${design}"]`).join(" ");

/** The generated form of a source selector, found by stripping the guard. */
function guarded(source: string) {
  const selector = liquidRules
    .flatMap((rule) => rule.selectors)
    .find((candidate) => candidate.replaceAll(LIQUID_GUARD, "") === source);
  if (!selector) throw new Error(`No generated rule for ${source}`);
  return selector;
}

/** Wraps `inner` in nested design scopes, outermost first, and returns #target. */
function mount(designs: readonly Design[], inner: string) {
  document.body.innerHTML = designs.reduceRight(
    (html, design) => `<div data-ogui-design="${design}">${html}</div>`,
    inner,
  );
  const target = document.getElementById("target");
  if (!target) throw new Error("mount needs an element with id target");
  return target;
}

describe("liquid nearest-scope guard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const chains: Array<[string, Design[], boolean]> = [
    ["plain liquid", ["liquid"], true],
    ["repeated liquid scopes", ["liquid", "liquid"], true],
    ["a classic island in a liquid app", ["liquid", "classic"], false],
    ["a liquid island in a classic app", ["classic", "liquid"], true],
    ["classic > liquid > classic", ["classic", "liquid", "classic"], false],
    ["classic > liquid > classic > liquid", ["classic", "liquid", "classic", "liquid"], true],
    ["liquid > classic > liquid", ["liquid", "classic", "liquid"], true],
    ["liquid > classic > liquid > classic", ["liquid", "classic", "liquid", "classic"], false],
    ["a classic app", ["classic"], false],
    ["no design scope", [], false],
  ];

  it("is the alternating classic/liquid chain, entirely inside :where()", () => {
    expect(GUARD_DEPTH).toBe(4);
    const C = scopeChain(["classic"]);
    const L = scopeChain(["liquid"]);
    expect(LIQUID_GUARD).toBe(
      `:not(:where(${C} *):not(:where(${C} ${L} *):not(:where(${C} ${L} ${C} *):not(:where(${C} ${L} ${C} ${L} *)))))`,
    );
    // Only :not() wrappers stay outside :where(), and :not() takes the
    // specificity of its argument, so the guard adds zero specificity.
    expect(LIQUID_GUARD.replace(/:where\([^()]*\)/g, "")).toBe(":not(:not(:not(:not())))");
  });

  it("sits on the subject compound of every scoped selector", () => {
    const scoped = liquidRules
      .flatMap((rule) => rule.selectors)
      .filter(
        (selector) =>
          selector.startsWith(`${SCOPE} `) &&
          !selector.startsWith(`${SCOPE} :where([data-ogui-tone`),
      );
    expect(scoped.length).toBeGreaterThan(100);
    for (const selector of scoped) {
      expect(selector.split(LIQUID_GUARD)).toHaveLength(2);
      // Nothing but an optional pseudo-element may follow the guard.
      expect(selector.slice(selector.indexOf(LIQUID_GUARD) + LIQUID_GUARD.length)).toMatch(
        /^(::[\w-]+)?$/,
      );
    }
  });

  it("leaves token definitions and self-scoped rules unguarded", () => {
    const unguarded = liquidRules
      .flatMap((rule) => rule.selectors)
      .filter(
        (selector) =>
          selector.startsWith(`${SCOPE} :where([data-ogui-tone`) ||
          selector.startsWith(".ogui-disclosure__surface:where("),
      );
    expect(unguarded.length).toBeGreaterThan(3);
    for (const selector of unguarded) expect(selector).not.toContain(LIQUID_GUARD);
  });

  it.each(chains)("button in %s %j: liquid %s", (_name, designs, expected) => {
    const selector = guarded(`${SCOPE} .ogui-button`);
    const button = mount(designs, '<button class="ogui-button" id="target"></button>');
    expect(button.matches(selector)).toBe(expected);
  });

  it.each(chains)("field input in %s %j: liquid %s", (_name, designs, expected) => {
    const selector = guarded(`${SCOPE} .ogui-field > input`);
    const input = mount(designs, '<label class="ogui-field"><input id="target" /></label>');
    expect(input.matches(selector)).toBe(expected);
  });

  describe("descendant rules", () => {
    // jsdom never reports :hover, so the dynamic state is dropped before matching.
    const dockHover = () =>
      guarded(`${SCOPE} .ogui-dock .ogui-button:hover:not(:disabled)`).replace(":hover", "");
    const dock = (inner: string) => `<div class="ogui-dock">${inner}</div>`;
    const button = '<button class="ogui-button" id="target"></button>';

    it("magnifies a liquid dock button", () => {
      expect(mount(["liquid"], dock(button)).matches(dockHover())).toBe(true);
      expect(mount(["classic", "liquid"], dock(button)).matches(dockHover())).toBe(true);
    });

    it("skips a button whose nearest scope, between dock and button, is classic", () => {
      const inner = dock(`<div data-ogui-design="classic">${button}</div>`);
      expect(mount(["liquid"], inner).matches(dockHover())).toBe(false);
    });

    it("styles a button when liquid re-opens between the classic scope and the button", () => {
      const inner = dock(
        `<div data-ogui-design="classic"><div data-ogui-design="liquid">${button}</div></div>`,
      );
      expect(mount(["liquid"], inner).matches(dockHover())).toBe(true);
    });

    it("skips a dock inside a classic island", () => {
      expect(mount(["liquid", "classic"], dock(button)).matches(dockHover())).toBe(false);
    });
  });

  describe("pseudo-element rules", () => {
    it("places the guard before ::before and ::after", () => {
      expect(guarded(`${SCOPE} .ogui-card::before`)).toBe(
        `${SCOPE} .ogui-card${LIQUID_GUARD}::before`,
      );
      expect(guarded(`${SCOPE} .ogui-button--quiet:hover:not(:disabled)::after`)).toBe(
        `${SCOPE} .ogui-button--quiet:hover:not(:disabled)${LIQUID_GUARD}::after`,
      );
      expect(
        guarded(`${SCOPE} :is(.ogui-slider input, .ogui-media input):active::-webkit-slider-thumb`),
      ).toBe(
        `${SCOPE} :is(.ogui-slider input, .ogui-media input):active${LIQUID_GUARD}::-webkit-slider-thumb`,
      );
    });

    it.each(chains)("::before host in %s %j: liquid %s", (_name, designs, expected) => {
      const selector = guarded(`${SCOPE} .ogui-card::before`).replace(/::before$/, "");
      const card = mount(designs, '<article class="ogui-card" id="target"></article>');
      expect(card.matches(selector)).toBe(expected);
    });
  });

  describe("generator edge cases", () => {
    const generated = (selector: string) => {
      const css = generateLiquidCss(`${selector} {}`);
      return css.slice(css.indexOf("\n") + 1, css.lastIndexOf("{}")).trimEnd();
    };

    it.each([
      [`${SCOPE} .a>.b`, `${SCOPE} .a>.b${LIQUID_GUARD}`],
      [`${SCOPE} .a + .b:hover`, `${SCOPE} .a + .b:hover${LIQUID_GUARD}`],
      [`${SCOPE} .a ~ .b`, `${SCOPE} .a ~ .b${LIQUID_GUARD}`],
      [`${SCOPE} :is(.a .b, .c > .d)::after`, `${SCOPE} :is(.a .b, .c > .d)${LIQUID_GUARD}::after`],
      [`${SCOPE} .a:before`, `${SCOPE} .a${LIQUID_GUARD}:before`],
      [`${SCOPE} .a [data-label="b c"]`, `${SCOPE} .a [data-label="b c"]${LIQUID_GUARD}`],
      [`${SCOPE} .a, ${SCOPE} .b`, `${SCOPE} .a${LIQUID_GUARD}, ${SCOPE} .b${LIQUID_GUARD}`],
      [`${SCOPE} :where([data-ogui-tone="dark"])`, `${SCOPE} :where([data-ogui-tone="dark"])`],
      ['.a:where([data-ogui-design="liquid"])', '.a:where([data-ogui-design="liquid"])'],
    ])("%s", (source, expected) => {
      expect(generated(source)).toBe(expected);
    });
  });
});

describe("liquid motion on portaled menus", () => {
  const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";
  const stopsAnimation = (rule: CssRule) => /animation:\s*none\s*!important/.test(rule.body);
  const matchesAny = (element: Element, rules: CssRule[]) =>
    rules.some((rule) => rule.selectors.some((selector) => element.matches(selector)));
  const reducedMotionRules = liquidRules.filter(
    (rule) => rule.at === REDUCED_MOTION && stopsAnimation(rule),
  );
  const motionOffRules = liquidRules.filter((rule) => rule.at === "" && stopsAnimation(rule));
  const bloomRules = liquidRules.filter(
    (rule) => rule.at === "" && /animation:\s*ogui-lg-bloom-in/.test(rule.body),
  );

  async function openMenu(motion: "on" | "off") {
    const user = userEvent.setup();
    render(
      <GlassProvider motion={motion}>
        <Menu label="Actions" trigger={<Button>More</Button>}>
          <MenuItem>Duplicate</MenuItem>
        </Menu>
      </GlassProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    const surface = document.querySelector("[data-ogui-disclosure-surface]");
    expect(surface?.closest("[data-ogui-portal='disclosure']")).toBeTruthy();
    return surface as HTMLElement;
  }

  it("blooms the portaled surface, which carries its own design scope", async () => {
    const surface = await openMenu("on");
    expect(surface.getAttribute("data-ogui-design")).toBe("liquid");
    expect(surface.parentElement?.closest("[data-ogui-design]")).toBeNull();
    expect(matchesAny(surface, bloomRules)).toBe(true);
  });

  it("stops the bloom under prefers-reduced-motion", async () => {
    const surface = await openMenu("on");
    expect(reducedMotionRules.length).toBeGreaterThan(0);
    expect(matchesAny(surface, reducedMotionRules)).toBe(true);
    expect(matchesAny(surface, motionOffRules)).toBe(false);
  });

  it("stops the bloom when motion is off", async () => {
    const surface = await openMenu("off");
    expect(surface.getAttribute("data-ogui-motion")).toBe("off");
    expect(matchesAny(surface, motionOffRules)).toBe(true);
  });

  it("leaves a classic surface alone", () => {
    document.body.innerHTML =
      '<div data-ogui-portal="disclosure"><div class="ogui-disclosure__surface" data-ogui-disclosure-surface="" data-ogui-design="classic" data-ogui-motion="off"></div></div>';
    const surface = document.querySelector("[data-ogui-disclosure-surface]") as HTMLElement;
    expect(matchesAny(surface, [...bloomRules, ...reducedMotionRules, ...motionOffRules])).toBe(
      false,
    );
    document.body.innerHTML = "";
  });
});

describe("liquid recipe hooks", () => {
  it("publishes the selected segment box for the sliding thumb", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SegmentedControl
        aria-label="View"
        items={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ]}
      />,
    );
    const group = screen.getByRole("group", { name: "View" });
    expect(container.querySelector(".ogui-segments__indicator")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(group.getAttribute("data-ogui-indicator")).toBe("ready");
    await user.click(screen.getByRole("button", { name: "List" }));
    expect(group.style.getPropertyValue("--ogui-indicator-w")).toMatch(/px$/);
  });

  it("keeps the tablist's accessible children to tabs only", () => {
    render(
      <Tabs
        label="Inspector"
        items={[
          { value: "a", label: "A", content: "Panel A" },
          { value: "b", label: "B", content: "Panel B" },
        ]}
      />,
    );
    const list = screen.getByRole("tablist", { name: "Inspector" });
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(list.querySelector(".ogui-tabs__indicator")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes slider progress for the filled liquid track", () => {
    const { container } = render(<Slider label="Volume" defaultValue={25} />);
    const slider = container.querySelector(".ogui-slider") as HTMLElement;
    expect(slider.style.getPropertyValue("--ogui-range-progress")).toBe("0.2500");
  });
});

describe("Pagination naming", () => {
  it("keeps its default name and accepts a caller's aria-label", async () => {
    const { Pagination } = await import("./index");
    render(
      <>
        <Pagination page={1} count={3} onPageChange={() => {}} />
        <Pagination aria-label="Results pages" page={1} count={3} onPageChange={() => {}} />
      </>,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Results pages" })).toBeTruthy();
  });
});
