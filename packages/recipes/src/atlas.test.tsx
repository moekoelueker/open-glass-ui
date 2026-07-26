// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Accordion,
  Banner,
  Card,
  Checkbox,
  Dialog,
  FileDropzone,
  NumberField,
  Pagination,
  RadioGroup,
  SearchField,
  Select,
  Stepper,
  Textarea,
  TextField,
  Toast,
  ToastProvider,
  ToggleButton,
  useToast,
} from "./index";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it("bounds rendering for very large counts", () => {
    render(<Pagination page={500_000_000} count={1_000_000_000} onPageChange={vi.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(
      screen.getByRole("button", { name: "Page 500000000" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("falls back to one page for invalid values", () => {
    render(
      <Pagination page={Number.NaN} count={Number.POSITIVE_INFINITY} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(
      (screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
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
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("keeps only the top dialog active and unwinds stacked focus in order", async () => {
    render(
      <Dialog title="First layer" triggerLabel="Open first layer" defaultOpen>
        <Dialog title="Second layer" triggerLabel="Open second layer" defaultOpen>
          Nested content
        </Dialog>
      </Dialog>,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "First layer" })).toBeTruthy();
      expect(screen.getByRole("dialog", { name: "Second layer" })).toBeTruthy();
    });
    const firstHost = screen
      .getByRole("dialog", { name: "First layer" })
      .closest<HTMLElement>("[data-ogui-portal]");
    const secondHost = screen
      .getByRole("dialog", { name: "Second layer" })
      .closest<HTMLElement>("[data-ogui-portal]");
    expect(firstHost?.inert).toBe(true);
    expect(secondHost?.inert).not.toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Second layer" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "First layer" })).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Open second layer" }),
      ),
    );
    expect(firstHost?.inert).not.toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "First layer" })).toBeNull();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open first layer" })),
    );
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

  it("closes after an action and reports the controlled state change", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Toast
        title="Export ready"
        actionLabel="Download"
        onAction={onAction}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Export ready")).toBeNull();
  });

  it("preserves the remaining timeout while interaction pauses dismissal", () => {
    vi.useFakeTimers();
    render(
      <Toast title="Render complete" duration={1_000} restoreLabel="">
        Ready
      </Toast>,
    );

    const toast = screen.getByRole("status");
    act(() => vi.advanceTimersByTime(400));
    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("Render complete")).toBeTruthy();

    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(599));
    expect(screen.getByText("Render complete")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Render complete")).toBeNull();
  });

  it("queues imperative notifications in a labelled viewport", async () => {
    const user = userEvent.setup();

    function Trigger() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() => toast({ title: "Material saved", description: "Draft 03" })}
        >
          Save material
        </button>
      );
    }

    render(
      <ToastProvider defaultDuration={0}>
        <Trigger />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Save material" }));
    expect(screen.getByRole("region", { name: "Notifications" })).toBeTruthy();
    expect(screen.getByText("Material saved")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Material saved")).toBeNull();
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

  it("provides stable native form names and accessible validation messages", () => {
    render(
      <>
        <TextField label="Email" error="Use a work email." />
        <Textarea label="Notes" error="Notes are required." />
        <Checkbox label="Accept terms" />
      </>,
    );

    const email = screen.getByRole("textbox", { name: "Email" });
    const notes = screen.getByRole("textbox", { name: "Notes" });
    const terms = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(email.getAttribute("name")).toBe(email.id);
    expect(notes.getAttribute("name")).toBe(notes.id);
    expect(terms.getAttribute("name")).toBe(terms.id);
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(notes.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  it("labels number controls with rich labels and disables them at the bounds", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumberField
        label={<span>Optical samples</span>}
        value={1}
        min={1}
        max={2}
        decrementLabel="Remove a sample"
        incrementLabel="Add a sample"
        onValueChange={onValueChange}
      />,
    );

    expect(
      (screen.getByRole("button", { name: "Remove a sample" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: "Add a sample" }));
    expect(onValueChange).toHaveBeenCalledWith(2);

    rerender(
      <NumberField
        label={<span>Optical samples</span>}
        value={2}
        min={1}
        max={2}
        decrementLabel="Remove a sample"
        incrementLabel="Add a sample"
        onValueChange={onValueChange}
      />,
    );
    expect(
      (screen.getByRole("button", { name: "Add a sample" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("gives native selects conservative browser defaults", () => {
    render(<Select label="Quality" options={[{ value: "high", label: "High" }]} />);

    const select = screen.getByRole("combobox", { name: "Quality" }) as HTMLSelectElement;
    expect(select.getAttribute("autocomplete")).toBe("off");
    expect(select.style.colorScheme).toBe("dark");
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

  it("reports an empty accepted list when every selected file is rejected", () => {
    const onFiles = vi.fn();
    const onRejected = vi.fn();
    render(
      <FileDropzone
        label="Add optical source"
        accept="image/png"
        maxSizeBytes={4}
        onFiles={onFiles}
        onRejected={onRejected}
      />,
    );
    const input = screen.getByLabelText("Add optical source");
    const file = new File(["pixels"], "source.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFiles).toHaveBeenCalledWith([]);
    expect(onRejected).toHaveBeenCalledWith([file]);
    expect(screen.getByRole("alert").textContent).toContain("1 file was rejected");
  });
});

describe("Card", () => {
  it("only becomes keyboard actionable when it has an action", () => {
    const onPress = vi.fn();
    const { rerender } = render(<Card title="Static">Read only</Card>);
    const staticCard = screen.getByText("Read only").closest("article");
    expect(staticCard?.getAttribute("role")).toBeNull();
    expect(staticCard?.getAttribute("tabindex")).toBeNull();
    expect(staticCard?.classList.contains("is-interactive")).toBe(false);

    rerender(
      <Card title="Visual only" interactive>
        Still read only
      </Card>,
    );
    const visualOnlyCard = screen.getByText("Still read only").closest("article");
    expect(visualOnlyCard?.getAttribute("role")).toBeNull();
    expect(visualOnlyCard?.getAttribute("tabindex")).toBeNull();
    expect(visualOnlyCard?.classList.contains("is-interactive")).toBe(false);

    rerender(
      <Card title="Actionable" onPress={onPress}>
        Open details
      </Card>,
    );
    const actionableCard = screen.getByRole("button", { name: /Actionable/ });
    fireEvent.keyDown(actionableCard, { key: "Enter" });
    expect(onPress).toHaveBeenCalledOnce();
    expect(actionableCard.classList.contains("is-interactive")).toBe(true);
  });
});

describe("Stepper", () => {
  it("does not emit duplicate-key warnings for repeated rich labels", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { rerender } = render(
      <Stepper
        current={0}
        items={[
          { label: <span>Repeated</span> },
          { label: <span>Repeated</span> },
          { label: "Repeated" },
          { label: "Repeated" },
        ]}
      />,
    );
    const firstStep = screen.getAllByRole("button")[0];
    rerender(
      <Stepper
        current={1}
        items={[
          { label: <span>Repeated</span> },
          { label: <span>Repeated</span> },
          { label: "Repeated" },
          { label: "Repeated" },
        ]}
      />,
    );

    expect(consoleError.mock.calls.some(([message]) => String(message).includes("same key"))).toBe(
      false,
    );
    expect(screen.getAllByRole("button")[0]).toBe(firstStep);
    consoleError.mockRestore();
  });
});
