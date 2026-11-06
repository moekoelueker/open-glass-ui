// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GlassProvider } from "@open-glass-ui/react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { generateLiquidCss } from "../../../scripts/generate-liquid-css.mjs";
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
        rules.push({ at, selectors: splitSelectorList(prelude), body: text.slice(start, index) });
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

  it("guards every scoped rule so the nearest design wins", () => {
    const css = read("./liquid.css");
    const guard = ':not(:where([data-ogui-design="classic"] *)';
    const scopedPreludes = [...css.matchAll(/([^{}]*)\{/g)]
      .map((match) => match[1] ?? "")
      .filter((prelude) => prelude.includes('[data-ogui-design="liquid"]) .ogui-'));
    expect(scopedPreludes.length).toBeGreaterThan(50);
    for (const prelude of scopedPreludes) {
      expect(prelude).toContain(guard);
    }
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
