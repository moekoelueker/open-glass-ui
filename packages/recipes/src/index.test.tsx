// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, Menu, MenuItem, SegmentedControl, Switch, Tabs } from "./index";

describe("SegmentedControl", () => {
  it("exposes a named group and changes its pressed value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Quality"
        defaultValue="medium"
        onValueChange={onValueChange}
        items={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ]}
      />,
    );

    expect(screen.getByRole("group", { name: "Quality" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "High" }));
    expect(onValueChange).toHaveBeenCalledWith("high");
    expect(screen.getByRole("button", { name: "High" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("Switch", () => {
  it("keeps switch semantics and supports controlled state", async () => {
    const user = userEvent.setup();

    function Fixture() {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          label="Spectral edge"
          description="Adds restrained color separation"
          checked={checked}
          onCheckedChange={setChecked}
        />
      );
    }

    render(<Fixture />);
    const control = screen.getByRole("switch", { name: "Spectral edge" });
    expect(control.getAttribute("aria-checked")).toBe("false");
    await user.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
  });
});

describe("Tabs", () => {
  it("supports arrow, Home, and End roving focus", () => {
    render(
      <Tabs
        label="Material views"
        items={[
          { value: "material", label: "Material", content: "Material panel" },
          { value: "optics", label: "Optics", content: "Optics panel" },
          { value: "code", label: "Code", content: "Code panel" },
        ]}
      />,
    );

    const material = screen.getByRole("tab", { name: "Material" });
    material.focus();
    fireEvent.keyDown(material, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Optics" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Optics panel")).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("tab", { name: "Optics" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "Code" }).getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Code" }), { key: "Home" });
    expect(screen.getByRole("tab", { name: "Material" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});

describe("Menu", () => {
  it("opens, closes on selection, and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(
      <Menu label="Actions" trigger={<Button>More</Button>}>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });
});
