// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeToStep } from "./atlas";
import {
  Button,
  Checkbox,
  Dialog,
  IconButton,
  NumberField,
  SearchField,
  Select,
  Slider,
  Switch,
  Textarea,
  TextField,
  Toast,
  ToggleButton,
  Tooltip,
} from "./index";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const read = (name: string) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");

function spinbutton(name: string) {
  return screen.getByRole("spinbutton", { name }) as HTMLInputElement;
}

describe("NumberField editing", () => {
  it("lets the field be cleared and retyped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberField label="Samples" defaultValue={5} onValueChange={onValueChange} />);
    const input = spinbutton("Samples");

    await user.clear(input);
    expect(input.value).toBe("");
    expect(onValueChange).not.toHaveBeenCalled();

    await user.type(input, "7");
    expect(input.value).toBe("7");
    expect(onValueChange).toHaveBeenLastCalledWith(7);
  });

  it("accepts a negative number typed from an empty field", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Offset"
        min={-10}
        max={10}
        defaultValue={0}
        onValueChange={onValueChange}
      />,
    );
    const input = spinbutton("Offset");

    await user.clear(input);
    await user.type(input, "-5");
    await user.tab();
    expect(input.value).toBe("-5");
    expect(onValueChange).toHaveBeenLastCalledWith(-5);
    expect(onValueChange.mock.calls.every(([next]) => next >= -10 && next <= 10)).toBe(true);
  });

  it("does not clamp intermediate digits towards the minimum while typing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function Fixture() {
      const [value, setValue] = useState(10);
      return (
        <NumberField
          label="Width"
          min={10}
          max={100}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }

    render(<Fixture />);
    const input = spinbutton("Width");
    await user.clear(input);
    await user.type(input, "20");
    expect(input.value).toBe("20");
    expect(onValueChange.mock.calls).toEqual([[20]]);

    await user.tab();
    expect(input.value).toBe("20");
    expect(onValueChange.mock.calls).toEqual([[20]]);
  });

  it("clamps an out-of-range draft on blur and reverts an empty one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Opacity"
        min={0}
        max={100}
        defaultValue={40}
        onValueChange={onValueChange}
      />,
    );
    const input = spinbutton("Opacity");

    await user.clear(input);
    await user.type(input, "500");
    expect(onValueChange).not.toHaveBeenCalledWith(500);
    await user.tab();
    expect(input.value).toBe("100");
    expect(onValueChange).toHaveBeenLastCalledWith(100);

    onValueChange.mockClear();
    await user.clear(input);
    await user.tab();
    expect(input.value).toBe("100");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps a typed off-step value, commits on Enter and steps from it on the grid", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberField label="Gap" min={0} max={10} defaultValue={0} onValueChange={onValueChange} />,
    );
    const input = spinbutton("Gap");

    // With the default step of 1 a typed 2.5 is accepted as is.
    await user.clear(input);
    await user.type(input, "2.5");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);
    expect(input.value).toBe("2.5");
    expect(document.activeElement).toBe(input);

    // An out-of-range draft waits for Enter and is clamped, not aligned.
    onValueChange.mockClear();
    await user.clear(input);
    await user.type(input, "50");
    expect(onValueChange).not.toHaveBeenCalledWith(50);
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(input.value).toBe("10");

    await user.clear(input);
    await user.type(input, "2.5");
    await user.tab();
    expect(input.value).toBe("2.5");

    // The steppers follow native stepUp/stepDown: an off-grid value moves to
    // the next grid value in that direction.
    await user.click(screen.getByRole("button", { name: "Increase Gap" }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(input.value).toBe("3");
    await user.click(screen.getByRole("button", { name: "Decrease Gap" }));
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it("steps from the current value without a min, so the input stays step-valid", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <form>
        <NumberField label="Rows" defaultValue={1} step={2} onValueChange={onValueChange} />
      </form>,
    );
    const input = screen.getByRole("spinbutton", { name: "Rows" }) as HTMLInputElement;
    // No caller minimum: no min attribute, so the native step base is the value.
    expect(input.hasAttribute("min")).toBe(false);
    expect(input.hasAttribute("max")).toBe(false);
    await user.click(screen.getByRole("button", { name: "Increase Rows" }));
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(input.value).toBe("3");
    expect(input.validity.stepMismatch).toBe(false);
    await user.click(screen.getByRole("button", { name: "Decrease Rows" }));
    await user.click(screen.getByRole("button", { name: "Decrease Rows" }));
    expect(onValueChange).toHaveBeenLastCalledWith(-1);
    expect(input.validity.stepMismatch).toBe(false);
  });

  it.each([
    ["read-only", { readOnly: true }],
    ["disabled", { disabled: true }],
  ] as const)("never changes a %s value, even an out-of-range one", async (_, lock) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Seats"
        min={10}
        defaultValue={5}
        onValueChange={onValueChange}
        {...lock}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Seats" }) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    await user.tab();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input.value).toBe("5");
  });

  it("discards a draft when the field becomes read-only while it is edited", () => {
    const onValueChange = vi.fn();
    const tree = (readOnly: boolean) => (
      <NumberField
        label="Seats"
        min={10}
        defaultValue={12}
        readOnly={readOnly}
        onValueChange={onValueChange}
      />
    );
    const { rerender } = render(tree(false));
    const input = screen.getByRole("spinbutton", { name: "Seats" }) as HTMLInputElement;
    input.focus();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3" } });
    rerender(tree(true));
    fireEvent.blur(input);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input.value).toBe("12");
  });

  it("steps down from an off-grid value to the grid below", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberField label="Ratio" min={0} value={2.5} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Decrease Ratio" }));
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it("steps on the grid and never past the bounds", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberField
        label="Columns"
        min={0}
        max={9}
        step={2}
        defaultValue={8}
        onValueChange={onValueChange}
      />,
    );

    const increase = screen.getByRole("button", { name: "Increase Columns" }) as HTMLButtonElement;
    expect(increase.disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Decrease Columns" }));
    expect(onValueChange).toHaveBeenLastCalledWith(6);
    expect(spinbutton("Columns").value).toBe("6");
    expect(increase.disabled).toBe(false);
  });

  it("shows controlled value changes while the field is not being edited", () => {
    const { rerender } = render(<NumberField label="Seed" value={3} />);
    expect(spinbutton("Seed").value).toBe("3");
    rerender(<NumberField label="Seed" value={42} />);
    expect(spinbutton("Seed").value).toBe("42");
  });
});

describe("Slider value normalization", () => {
  function output(container: HTMLElement) {
    return container.querySelector("output")?.textContent;
  }

  function progress(container: HTMLElement) {
    return (container.querySelector(".ogui-slider") as HTMLElement).style.getPropertyValue(
      "--ogui-range-progress",
    );
  }

  it("starts at the minimum without a value, on both the thumb and the text", () => {
    const { container } = render(<Slider label="Depth" min={20} max={80} />);
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("20");
    expect(output(container)).toBe("20");
    expect(progress(container)).toBe("0.0000");
  });

  it("clamps an out-of-range default", () => {
    const { container } = render(<Slider label="Depth" max={100} defaultValue={150} unit="%" />);
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("100");
    expect(output(container)).toBe("100%");
    expect(progress(container)).toBe("1.0000");
  });

  it("aligns to the step from the minimum, ties up, never past the maximum", () => {
    const { container, rerender } = render(
      <Slider label="Grid" min={0} max={10} step={4} defaultValue={9} />,
    );
    expect(output(container)).toBe("8");
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("8");

    rerender(<Slider label="Grid" min={0} max={10} step={4} value={6} />);
    expect(output(container)).toBe("8");
    rerender(<Slider label="Grid" min={0} max={10} step={4} value={10} />);
    expect(output(container)).toBe("8");
    rerender(<Slider label="Grid" min={0} max={10} step={4} value={-3} />);
    expect(output(container)).toBe("0");
  });

  it("only clamps with step any", () => {
    const { container } = render(
      <Slider label="Mix" min={0} max={1} step="any" defaultValue={0.37} />,
    );
    expect(output(container)).toBe("0.37");
  });

  it("keeps the live value numeric and resyncs after a form reset", async () => {
    const { container } = render(
      <form>
        <Slider label="Grain" defaultValue={30} unit="%" />
      </form>,
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.input(slider, { target: { value: "70" } });
    expect(output(container)).toBe("70%");
    expect(progress(container)).toBe("0.7000");

    act(() => (container.querySelector("form") as HTMLFormElement).reset());
    await waitFor(() => expect(output(container)).toBe("30%"));
    expect(slider.value).toBe("30");
  });

  it("resets to the latest default and keeps an edited value when the default changes", async () => {
    const tree = (defaultValue: number) => (
      <form>
        <Slider label="Grain" name="grain" defaultValue={defaultValue} unit="%" />
      </form>
    );
    const { container, rerender } = render(tree(30));
    const slider = screen.getByRole("slider") as HTMLInputElement;
    const form = container.querySelector("form") as HTMLFormElement;
    fireEvent.input(slider, { target: { value: "70" } });

    rerender(tree(60));
    // A new default does not overwrite what the user chose.
    expect(slider.value).toBe("70");
    expect(output(container)).toBe("70%");

    act(() => form.reset());
    await waitFor(() => expect(output(container)).toBe("60%"));
    expect(slider.value).toBe("60");
    expect(new FormData(form).get("grain")).toBe("60");
  });

  it("shows the native value after the default changes on an untouched slider", () => {
    const tree = (defaultValue: number) => (
      <Slider label="Grain" defaultValue={defaultValue} unit="%" />
    );
    const { container, rerender } = render(tree(30));
    const slider = screen.getByRole("slider") as HTMLInputElement;
    rerender(tree(60));
    // Like any uncontrolled input, a later default only affects reset; the
    // text must agree with whatever the native input now holds.
    expect(output(container)).toBe(`${slider.value}%`);
  });

  it("runs a callback ref's cleanup instead of calling it with null", () => {
    const cleanupRef = vi.fn();
    const calls: (HTMLInputElement | null)[] = [];
    const callbackRef = (node: HTMLInputElement | null) => {
      calls.push(node);
      return cleanupRef;
    };
    const { unmount } = render(<Slider label="Grain" ref={callbackRef} />);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBeInstanceOf(HTMLInputElement);
    unmount();
    expect(cleanupRef).toHaveBeenCalledOnce();
    expect(calls).toHaveLength(1);
  });

  it("still clears object refs and plain callback refs on unmount", () => {
    const objectRef = createRef<HTMLInputElement>();
    const first = render(<Slider label="Grain" ref={objectRef} />);
    expect(objectRef.current).toBeInstanceOf(HTMLInputElement);
    first.unmount();
    expect(objectRef.current).toBeNull();

    const calls: (HTMLInputElement | null)[] = [];
    const second = render(<Slider label="Grain" ref={(node) => void calls.push(node)} />);
    second.unmount();
    expect(calls.at(-1)).toBeNull();
  });

  it("resyncs after a reset of the form it moved to", async () => {
    const tree = (form: string) => (
      <>
        <form id="first" />
        <form id="second" />
        <Slider label="Grain" form={form} defaultValue={30} unit="%" />
      </>
    );
    const { container, rerender } = render(tree("first"));
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.input(slider, { target: { value: "70" } });
    rerender(tree("second"));
    expect(slider.form?.id).toBe("second");

    act(() => (container.querySelector("#second") as HTMLFormElement).reset());
    await waitFor(() => expect(output(container)).toBe("30%"));
    expect(slider.value).toBe("30");
  });

  it("follows the native value when the bounds change under an uncontrolled slider", () => {
    const tree = (max: number) => (
      <form>
        <Slider label="Grain" name="grain" max={max} defaultValue={30} />
      </form>
    );
    const { container, rerender } = render(tree(100));
    const slider = screen.getByRole("slider") as HTMLInputElement;
    const form = container.querySelector("form") as HTMLFormElement;
    // Browsers clamp a range input as soon as its max shrinks, without an input
    // event; jsdom does not, so this node does it the way Chromium does.
    const nativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    const setAttribute = slider.setAttribute.bind(slider);
    slider.setAttribute = (name: string, value: string) => {
      setAttribute(name, value);
      if (name === "max" && Number(slider.value) > Number(value)) {
        nativeValue?.set?.call(slider, value);
      }
    };
    fireEvent.input(slider, { target: { value: "80" } });
    expect(output(container)).toBe("80");

    rerender(tree(50));
    expect(slider.value).toBe("50");
    expect(output(container)).toBe("50");
    expect(progress(container)).toBe("1.0000");

    // Widening the range again does not bring 80 back, natively or in the text.
    rerender(tree(100));
    expect(slider.value).toBe("50");
    expect(output(container)).toBe("50");
    expect(progress(container)).toBe("0.5000");
    expect(new FormData(form).get("grain")).toBe("50");
  });

  it("aligns the native value itself where a new step leaves it off the grid", () => {
    // WebKit keeps a dirty value that a new step no longer allows (and jsdom
    // never re-sanitizes), so the slider writes the aligned value back.
    const tree = (step: number) => (
      <form>
        <Slider label="Grain" name="grain" step={step} defaultValue={30} />
      </form>
    );
    const { container, rerender } = render(tree(1));
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.input(slider, { target: { value: "50" } });

    rerender(tree(7));
    expect(slider.value).toBe("49");
    expect(output(container)).toBe("49");
    expect(new FormData(container.querySelector("form") as HTMLFormElement).get("grain")).toBe(
      "49",
    );
  });

  it("normalizes with a precise step grid", () => {
    const rule = { min: 0, max: 1, base: 0, step: 0.1 };
    expect(normalizeToStep(0.15, rule)).toBe(0.2);
    expect(normalizeToStep(0.3000000004, rule)).toBe(0.3);
    expect(normalizeToStep(2, rule)).toBe(1);
    expect(normalizeToStep(0.5, { min: 0, max: 0.5, base: 0, step: 1 })).toBe(0);
  });
});

describe("caller ARIA on native controls", () => {
  it("merges aria-describedby and keeps a caller's aria-invalid", () => {
    render(
      <>
        <span id="external-help">Shared help</span>
        <TextField label="Email" hint="Use a work email." aria-describedby="external-help" />
        <TextField label="Alias" aria-invalid="true" />
        <TextField label="Team" aria-invalid="false" error="Pick a team." />
        <Textarea label="Notes" hint="Optional." aria-describedby="external-help" />
        <Textarea label="Summary" aria-invalid="true" />
        <Checkbox
          label="Terms"
          description="Required to continue."
          aria-describedby="external-help"
          aria-invalid="true"
        />
        <Switch label="Alerts" description="Daily digest." aria-describedby="external-help" />
      </>,
    );

    const email = screen.getByRole("textbox", { name: "Email" });
    expect(email.getAttribute("aria-describedby")).toBe(`external-help ${email.id}-message`);
    expect(screen.getByRole("textbox", { name: "Alias" }).getAttribute("aria-invalid")).toBe(
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Team" }).getAttribute("aria-invalid")).toBe("true");

    const notes = screen.getByRole("textbox", { name: "Notes" });
    expect(notes.getAttribute("aria-describedby")).toBe(`external-help ${notes.id}-message`);
    expect(screen.getByRole("textbox", { name: "Summary" }).getAttribute("aria-invalid")).toBe(
      "true",
    );

    const terms = screen.getByRole("checkbox", { name: "Terms" });
    expect(terms.getAttribute("aria-describedby")).toBe(`external-help ${terms.id}-description`);
    expect(terms.getAttribute("aria-invalid")).toBe("true");

    const alerts = screen.getByRole("switch", { name: "Alerts" });
    expect(alerts.getAttribute("aria-describedby")).toBe(`external-help ${alerts.id}-description`);
  });

  it("keeps a tooltip description on a wrapped text field", () => {
    render(
      <Tooltip label="Shown on the public profile">
        <TextField label="Display name" hint="Up to 30 characters." />
      </Tooltip>,
    );
    const field = screen.getByRole("textbox", { name: "Display name" });
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(field.getAttribute("aria-describedby")?.split(" ")).toEqual([
      tooltip.id,
      `${field.id}-message`,
    ]);
  });

  it("omits aria-describedby when there is nothing to reference", () => {
    render(<TextField label="Plain" />);
    expect(screen.getByRole("textbox", { name: "Plain" }).hasAttribute("aria-describedby")).toBe(
      false,
    );
  });
});

describe("SearchField clear button", () => {
  it("cannot clear a disabled or read-only field", () => {
    const onValueChange = vi.fn();
    render(
      <>
        <SearchField label="Locked" defaultValue="glass" disabled onValueChange={onValueChange} />
        <SearchField label="Fixed" defaultValue="frost" readOnly onValueChange={onValueChange} />
      </>,
    );

    for (const [label, value] of [
      ["Locked", "glass"],
      ["Fixed", "frost"],
    ] as const) {
      const clear = screen.getByRole("button", { name: `Clear ${label}` }) as HTMLButtonElement;
      expect(clear.disabled).toBe(true);
      fireEvent.click(clear);
      expect((screen.getByRole("searchbox", { name: label }) as HTMLInputElement).value).toBe(
        value,
      );
    }
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("still clears an editable field", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search" defaultValue="glass" />);
    await user.click(screen.getByRole("button", { name: "Clear Search" }));
    expect((screen.getByRole("searchbox", { name: "Search" }) as HTMLInputElement).value).toBe("");
  });
});

describe("Toast pause", () => {
  it("stays paused while focus is inside after the pointer leaves", () => {
    vi.useFakeTimers();
    render(
      <Toast title="Upload finished" actionLabel="Open" duration={1_000} restoreLabel="">
        Ready
      </Toast>,
    );
    const toast = screen.getByRole("status");
    const action = screen.getByRole("button", { name: "Open" });

    act(() => vi.advanceTimersByTime(400));
    fireEvent.mouseEnter(toast);
    act(() => action.focus());
    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("Upload finished")).toBeTruthy();

    act(() => action.blur());
    act(() => vi.advanceTimersByTime(599));
    expect(screen.getByText("Upload finished")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Upload finished")).toBeNull();
  });

  it("reopens unpaused with a fresh duration through the restore button", () => {
    vi.useFakeTimers();
    render(<Toast title="Draft saved" duration={1_000} />);
    const toast = screen.getByRole("status");

    fireEvent.mouseEnter(toast);
    act(() => screen.getByRole("button", { name: "Dismiss notification" }).focus());
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Draft saved")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    expect(screen.getByText("Draft saved")).toBeTruthy();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByText("Draft saved")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Draft saved")).toBeNull();
  });

  it("reopens unpaused after a controlled close while hovered", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Toast title="Sync done" duration={1_000} open onOpenChange={onOpenChange} />,
    );
    fireEvent.mouseEnter(screen.getByRole("status"));

    rerender(<Toast title="Sync done" duration={1_000} open={false} onOpenChange={onOpenChange} />);
    rerender(<Toast title="Sync done" duration={1_000} open onOpenChange={onOpenChange} />);
    act(() => vi.advanceTimersByTime(1_000));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("refs reach the native element", () => {
  it("forwards refs on every native-control recipe", () => {
    const refs = {
      button: createRef<HTMLButtonElement>(),
      iconButton: createRef<HTMLButtonElement>(),
      textField: createRef<HTMLInputElement>(),
      textarea: createRef<HTMLTextAreaElement>(),
      checkbox: createRef<HTMLInputElement>(),
      switch: createRef<HTMLInputElement>(),
      select: createRef<HTMLSelectElement>(),
      search: createRef<HTMLInputElement>(),
      number: createRef<HTMLInputElement>(),
      slider: createRef<HTMLInputElement>(),
      toggle: createRef<HTMLButtonElement>(),
    };
    let sliderCallbackNode: HTMLInputElement | null = null;
    render(
      <>
        <Button ref={refs.button}>Save</Button>
        <IconButton ref={refs.iconButton} aria-label="Close panel">
          x
        </IconButton>
        <TextField ref={refs.textField} label="Name" />
        <Textarea ref={refs.textarea} label="Bio" />
        <Checkbox ref={refs.checkbox} label="Agree" />
        <Switch ref={refs.switch} label="Wifi" />
        <Select ref={refs.select} label="Size" options={[{ value: "m", label: "Medium" }]} />
        <SearchField ref={refs.search} label="Find" />
        <NumberField ref={refs.number} label="Count" />
        <Slider ref={refs.slider} label="Level" />
        <Slider
          ref={(node) => {
            sliderCallbackNode = node;
          }}
          label="Volume"
        />
        <ToggleButton ref={refs.toggle}>Bold</ToggleButton>
      </>,
    );

    expect(refs.button.current).toBe(screen.getByRole("button", { name: "Save" }));
    expect(refs.iconButton.current).toBe(screen.getByRole("button", { name: "Close panel" }));
    expect(refs.textField.current).toBe(screen.getByRole("textbox", { name: "Name" }));
    expect(refs.textarea.current).toBe(screen.getByRole("textbox", { name: "Bio" }));
    expect(refs.checkbox.current).toBe(screen.getByRole("checkbox", { name: "Agree" }));
    expect(refs.switch.current).toBe(screen.getByRole("switch", { name: "Wifi" }));
    expect(refs.select.current).toBe(screen.getByRole("combobox", { name: "Size" }));
    expect(refs.search.current).toBe(screen.getByRole("searchbox", { name: "Find" }));
    expect(refs.number.current).toBe(screen.getByRole("spinbutton", { name: "Count" }));
    expect(refs.slider.current).toBe(screen.getByRole("slider", { name: "Level" }));
    expect(sliderCallbackNode).toBe(screen.getByRole("slider", { name: "Volume" }));
    expect(refs.toggle.current).toBe(screen.getByRole("button", { name: "Bold" }));
  });
});

describe("Overlay description", () => {
  it("renders on the body inset with muted ink and no browser margin", async () => {
    render(
      <Dialog title="Export" description="Choose a format for the frames." defaultOpen>
        Body
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Export" });
    const description = dialog.querySelector(".ogui-overlay__description");
    expect(description?.id).toBe(dialog.getAttribute("aria-describedby"));

    const css = read("./styles.css");
    const rule = css.match(/\n\.ogui-overlay__description \{([^}]*)\}/)?.[1] ?? "";
    const body = css.match(/\n\.ogui-overlay__body \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("margin: 0;");
    expect(rule).toContain("padding: 0.85rem 1.1rem 0;");
    expect(body).toContain("padding: 1.1rem;");
    expect(rule).toContain("color: var(--ogui-color-muted");
    expect(rule).toContain("font-size: 0.82rem;");
  });
});
