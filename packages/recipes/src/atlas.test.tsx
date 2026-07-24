// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Accordion,
  Banner,
  Checkbox,
  Dialog,
  FileDropzone,
  NumberField,
  Pagination,
  RadioGroup,
  SearchField,
  Toast,
  ToggleButton,
} from "./index";

afterEach(cleanup);

describe("Pagination and Accordion", () => {
  it("changes pages and exposes only expanded disclosure content", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <>
        <Pagination page={2} count={4} onPageChange={onPageChange} />
        <Accordion
          items={[
            { id: "one", title: "First question", content: "First answer" },
            { id: "two", title: "Second question", content: "Second answer" },
          ]}
        />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByText("First answer")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Second question" }));
    expect(screen.queryByText("First answer")).toBeNull();
    expect(screen.getByText("Second answer")).toBeTruthy();
  });
});

describe("Dialog", () => {
  it("moves focus inside, closes on Escape, and restores the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Publish material" triggerLabel="Open publish dialog">
        Ready to publish.
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Open publish dialog" });
    await user.click(trigger);
    const close = screen.getAllByRole("button", { name: "Close Publish material" }).at(-1);
    expect(close).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(close));
    expect(screen.getByRole("dialog", { name: "Publish material" })).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe("Toast and Banner", () => {
  it("dismisses and restores transient feedback", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Toast title="Preset saved">Ready</Toast>
        <Banner title="Quality policy" dismissible>
          Adaptive
        </Banner>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Preset saved")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Show toast" }));
    expect(screen.getByText("Preset saved")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Dismiss banner" }));
    expect(screen.queryByText("Quality policy")).toBeNull();
  });
});

describe("form recipes", () => {
  it("supports checkbox, radio, toggle, search, and bounded stepping", async () => {
    const user = userEvent.setup();

    function Fixture() {
      const [radio, setRadio] = useState("balanced");
      const [search, setSearch] = useState("glass");
      const [number, setNumber] = useState(2);
      return (
        <>
          <Checkbox label="Adaptive quality" />
          <RadioGroup
            label="Priority"
            value={radio}
            onValueChange={setRadio}
            items={[
              { value: "balanced", label: "Balanced" },
              { value: "speed", label: "Speed" },
            ]}
          />
          <ToggleButton>Highlights</ToggleButton>
          <SearchField label="Search recipes" value={search} onValueChange={setSearch} />
          <NumberField label="Samples" min={1} max={3} value={number} onValueChange={setNumber} />
        </>
      );
    }

    render(<Fixture />);
    await user.click(screen.getByRole("checkbox", { name: "Adaptive quality" }));
    expect(
      (screen.getByRole("checkbox", { name: "Adaptive quality" }) as HTMLInputElement).checked,
    ).toBe(true);

    await user.click(screen.getByRole("radio", { name: "Speed" }));
    expect((screen.getByRole("radio", { name: "Speed" }) as HTMLInputElement).checked).toBe(true);

    const toggle = screen.getByRole("button", { name: "Highlights" });
    await user.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");

    await user.click(screen.getByRole("button", { name: "Clear Search recipes" }));
    expect(
      (screen.getByRole("searchbox", { name: "Search recipes" }) as HTMLInputElement).value,
    ).toBe("");

    const increase = screen.getByRole("button", { name: "Increase Samples" });
    await user.click(increase);
    await user.click(increase);
    expect((screen.getByRole("spinbutton", { name: "Samples" }) as HTMLInputElement).value).toBe(
      "3",
    );
  });
});

describe("FileDropzone", () => {
  it("reports selected files through the native file input", () => {
    const onFiles = vi.fn();
    render(<FileDropzone label="Add optical source" multiple onFiles={onFiles} />);
    const input = screen.getByLabelText("Add optical source");
    const file = new File(["pixels"], "source.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(screen.getByText("source.png")).toBeTruthy();
  });
});
