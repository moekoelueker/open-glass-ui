// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { generateLiquidCss } from "../../../scripts/generate-liquid-css.mjs";
import { SegmentedControl, Slider, Tabs } from "./index";

afterEach(cleanup);

const read = (name: string) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");

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
