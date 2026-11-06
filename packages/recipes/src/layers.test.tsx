// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Button,
  Dialog,
  Menu,
  MenuItem,
  Popover,
  TextField,
  ToastProvider,
  Tooltip,
  useToast,
} from "./index";
import { getOpenLayers } from "./layers";

afterEach(cleanup);

const read = (name: string) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");

function hostOf(element: Element) {
  const host = element.closest<HTMLElement>("[data-ogui-portal]");
  if (!host) {
    throw new Error("Element is not inside a portal host.");
  }
  return host;
}

/** Layer hosts are positioned, so their z-index orders the fixed content inside. */
function layerZ(host: HTMLElement) {
  expect(host.style.position).toBe("relative");
  return Number(host.style.zIndex);
}

const nextFrames = () => new Promise((resolve) => setTimeout(resolve, 60));

describe("Dialog effect stability", () => {
  it("keeps focus in a parent-controlled field while an inline onOpenChange changes", async () => {
    const user = userEvent.setup();

    function Fixture() {
      const [open, setOpen] = useState(true);
      const [name, setName] = useState("");
      return (
        <Dialog title="Rename layer" open={open} onOpenChange={(next) => setOpen(next)}>
          <TextField
            label="Layer name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </Dialog>
      );
    }

    render(<Fixture />);
    const field = (await screen.findByRole("textbox", { name: "Layer name" })) as HTMLInputElement;
    const close = screen.getAllByRole("button", { name: "Close Rename layer" }).at(-1);
    await waitFor(() => expect(document.activeElement).toBe(close));

    await user.click(field);
    await user.type(field, "Hero");
    await nextFrames();

    expect(field.value).toBe("Hero");
    expect(document.activeElement).toBe(field);
    expect(getOpenLayers()).toHaveLength(1);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks the document once the last modal closes", async () => {
    render(
      <Dialog title="Settings" triggerLabel="Open settings" defaultOpen>
        Body
      </Dialog>,
    );
    await screen.findByRole("dialog", { name: "Settings" });
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(getOpenLayers()).toHaveLength(0);
  });
});

describe("layer stack", () => {
  it("closes a menu inside a dialog before the dialog and paints it above", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Layer settings" defaultOpen>
        <Menu label="Layer actions" trigger={<Button>More</Button>}>
          <MenuItem>Duplicate</MenuItem>
        </Menu>
      </Dialog>,
    );

    const trigger = await screen.findByRole("button", { name: "Layer actions" });
    await user.click(trigger);
    const item = await screen.findByRole("menuitem", { name: "Duplicate" });
    const dialogHost = hostOf(screen.getByRole("dialog", { name: "Layer settings" }));
    const menuHost = hostOf(item);

    const [dialogLayer, menuLayer] = getOpenLayers();
    expect(dialogLayer?.kind).toBe("modal");
    expect(menuLayer).toMatchObject({ kind: "disclosure", owner: dialogLayer?.id });
    expect(layerZ(dialogHost)).toBe(80);
    expect(layerZ(menuHost)).toBe(82);
    expect(menuHost.inert).not.toBe(true);
    expect(dialogHost.inert).not.toBe(true);

    fireEvent.keyDown(item, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Layer settings" })).toBeTruthy();
    expect(document.activeElement).toBe(trigger);
    // A closed layer gives its host back unpositioned.
    expect(menuHost.style.position).toBe("");
    expect(menuHost.style.zIndex).toBe("");

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("puts a dialog opened from a popover above it and makes the popover inert", async () => {
    const user = userEvent.setup();

    function Fixture() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Popover label="Inspector" trigger={<Button>Inspect</Button>}>
            <button type="button" onClick={() => setOpen(true)}>
              Publish
            </button>
          </Popover>
          <Dialog title="Confirm publish" open={open} onOpenChange={setOpen}>
            Ready to publish.
          </Dialog>
        </>
      );
    }

    render(<Fixture />);
    const trigger = screen.getByRole("button", { name: "Inspector" });
    await user.click(trigger);
    await user.click(await screen.findByRole("button", { name: "Publish" }));

    const dialog = await screen.findByRole("dialog", { name: "Confirm publish" });
    const dialogHost = hostOf(dialog);
    const popoverHost = hostOf(screen.getByRole("button", { name: "Publish" }));
    const [popoverLayer, dialogLayer] = getOpenLayers();
    // The trigger-less dialog is owned by the popover its opener sat in.
    expect(dialogLayer?.owner).toBe(popoverLayer?.id);
    expect(layerZ(dialogHost)).toBeGreaterThan(layerZ(popoverHost));
    expect(popoverHost.inert).toBe(true);
    expect(dialogHost.inert).not.toBe(true);

    // Pressing inside the later dialog is not an outside press for the popover.
    fireEvent.pointerDown(screen.getByText("Ready to publish."));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Confirm publish" })).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(popoverHost.inert).not.toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(getOpenLayers()).toHaveLength(0);
  });

  it("orders dialog, popover and a second dialog, and unwinds them one Escape at a time", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Project" defaultOpen>
        <Popover label="Share" trigger={<Button>Share</Button>}>
          <Dialog title="Invite" triggerLabel="Invite people">
            Invite body
          </Dialog>
        </Popover>
      </Dialog>,
    );

    const shareTrigger = await screen.findByRole("button", { name: "Share" });
    await user.click(shareTrigger);
    await user.click(await screen.findByRole("button", { name: "Invite people" }));
    const invite = await screen.findByRole("dialog", { name: "Invite" });

    const projectHost = hostOf(screen.getByRole("dialog", { name: "Project" }));
    const shareHost = hostOf(screen.getByRole("button", { name: "Invite people" }));
    const inviteHost = hostOf(invite);
    const [projectLayer, shareLayer, inviteLayer] = getOpenLayers();
    expect(projectLayer).toMatchObject({ kind: "modal", owner: null });
    expect(shareLayer).toMatchObject({ kind: "disclosure", owner: projectLayer?.id });
    expect(inviteLayer).toMatchObject({ kind: "modal", owner: shareLayer?.id });
    expect(layerZ(projectHost)).toBeLessThan(layerZ(shareHost));
    expect(layerZ(shareHost)).toBeLessThan(layerZ(inviteHost));
    expect(projectHost.inert).toBe(true);
    expect(shareHost.inert).toBe(true);
    expect(inviteHost.inert).not.toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Invite" })).toBeNull();
    expect(shareTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(projectHost.inert).not.toBe(true);
    expect(shareHost.inert).not.toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(shareTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("dialog", { name: "Project" })).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Project" })).toBeNull();
    expect(getOpenLayers()).toHaveLength(0);
  });

  it("keeps a controlled menu outside the active dialog inert and below it", async () => {
    function Fixture() {
      const [menuOpen, setMenuOpen] = useState(false);
      return (
        <>
          <Menu
            label="Page actions"
            trigger={<Button>Page</Button>}
            open={menuOpen}
            onOpenChange={setMenuOpen}
          >
            <MenuItem>Export</MenuItem>
          </Menu>
          <Dialog title="Review" defaultOpen>
            <button type="button" onClick={() => setMenuOpen(true)}>
              Show page actions
            </button>
          </Dialog>
        </>
      );
    }

    render(<Fixture />);
    const dialogHost = hostOf(await screen.findByRole("dialog", { name: "Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Show page actions" }));
    const menuHost = hostOf(await screen.findByRole("menuitem", { name: "Export" }));

    expect(getOpenLayers()).toMatchObject([
      { kind: "modal", owner: null },
      { kind: "disclosure", owner: null },
    ]);
    expect(menuHost.inert).toBe(true);
    expect(dialogHost.inert).not.toBe(true);
    expect(layerZ(menuHost)).toBeLessThan(layerZ(dialogHost));

    // The unreachable menu does not take Escape from the dialog.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Review" })).toBeNull();
    expect(menuHost.inert).not.toBe(true);
    expect(screen.getByRole("menuitem", { name: "Export" })).toBeTruthy();
    expect(layerZ(menuHost)).toBe(80);
  });

  it("keeps a popover open while an item of a menu opened from it is pressed", async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();
    render(
      <Popover label="Layer" trigger={<Button>Layer</Button>}>
        <Menu label="Layer actions" trigger={<Button>Actions</Button>}>
          <MenuItem onClick={onDuplicate}>Duplicate</MenuItem>
        </Menu>
      </Popover>,
    );

    const popoverTrigger = screen.getByRole("button", { name: "Layer" });
    await user.click(popoverTrigger);
    const menuTrigger = await screen.findByRole("button", { name: "Layer actions" });
    await user.click(menuTrigger);
    await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }));

    expect(onDuplicate).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(popoverTrigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps the toast viewport live under a modal and lets a focused toast consume Escape", async () => {
    const user = userEvent.setup();

    function SaveButton() {
      const { toast } = useToast();
      return (
        <button type="button" onClick={() => toast({ title: "Saved", actionLabel: "Undo" })}>
          Save
        </button>
      );
    }

    render(
      <ToastProvider defaultDuration={0}>
        <Dialog title="Editor" defaultOpen>
          <SaveButton />
        </Dialog>
      </ToastProvider>,
    );

    await user.click(await screen.findByRole("button", { name: "Save" }));
    const viewport = screen.getByRole("region", { name: "Notifications" });
    const toastHost = hostOf(viewport);
    expect(toastHost.getAttribute("data-ogui-portal")).toBe("toast");
    expect(toastHost.style.position).toBe("relative");
    expect(Number(toastHost.style.zIndex)).toBe(1000);
    expect(toastHost.inert).not.toBe(true);
    expect(viewport.inert).not.toBe(true);

    const undo = screen.getByRole("button", { name: "Undo" });
    act(() => undo.focus());
    fireEvent.keyDown(undo, { key: "Escape" });
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Editor" })).toBeTruthy();
  });

  it("wraps the modal Tab trap around a popover opened from the dialog", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Filters" defaultOpen>
        <Popover label="Range" trigger={<Button>Range</Button>}>
          <button type="button">Apply range</button>
        </Popover>
      </Dialog>,
    );

    await user.click(await screen.findByRole("button", { name: "Range" }));
    const apply = await screen.findByRole("button", { name: "Apply range" });
    await waitFor(() => expect(document.activeElement).toBe(apply));

    // The popover's last control is the end of the dialog's focus scope.
    const close = screen.getAllByRole("button", { name: "Close Filters" });
    const tab = fireEvent.keyDown(apply, { key: "Tab" });
    expect(tab).toBe(false);
    expect(close).toContain(document.activeElement);
  });
});

describe("Tooltip visibility", () => {
  it("dismisses a hovered tooltip on Escape while focus is elsewhere", () => {
    render(
      <>
        <Tooltip label="Regenerate optical mesh">
          <Button>Regenerate</Button>
        </Tooltip>
        <TextField label="Notes" />
      </>,
    );

    const wrapper = screen.getByRole("button", { name: "Regenerate" }).closest(".ogui-tooltip");
    if (!wrapper) {
      throw new Error("Missing tooltip wrapper.");
    }
    fireEvent.mouseEnter(wrapper);
    expect(getOpenLayers().map((layer) => layer.kind)).toEqual(["tooltip"]);

    const notes = screen.getByRole("textbox", { name: "Notes" });
    act(() => notes.focus());
    fireEvent.keyDown(notes, { key: "Escape" });
    expect(wrapper.getAttribute("data-dismissed")).toBe("true");
    expect(getOpenLayers()).toHaveLength(0);

    fireEvent.mouseLeave(wrapper);
    expect(wrapper.getAttribute("data-dismissed")).toBe("false");
  });

  it("closes a visible tooltip inside a dialog before the dialog", async () => {
    render(
      <Dialog title="Mesh" defaultOpen>
        <Tooltip label="Rebuild the mesh">
          <Button>Rebuild</Button>
        </Tooltip>
      </Dialog>,
    );

    const button = await screen.findByRole("button", { name: "Rebuild" });
    await nextFrames();
    act(() => button.focus());
    const wrapper = button.closest(".ogui-tooltip");
    expect(getOpenLayers().map((layer) => layer.kind)).toEqual(["modal", "tooltip"]);

    fireEvent.keyDown(button, { key: "Escape" });
    expect(wrapper?.getAttribute("data-dismissed")).toBe("true");
    expect(screen.getByRole("dialog", { name: "Mesh" })).toBeTruthy();

    fireEvent.keyDown(button, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Mesh" })).toBeNull();
  });

  it("makes the shown bubble hoverable across the gap without painting at rest", () => {
    const css = read("./styles.css");
    expect(css).toMatch(
      /\.ogui-tooltip::before,\s*\.ogui-tooltip__bubble::before\s*\{[^}]*height: 0\.5rem;[^}]*content: "";[^}]*pointer-events: none;/,
    );
    expect(css).toMatch(
      /\.ogui-tooltip:hover \.ogui-tooltip__bubble,\s*\.ogui-tooltip:focus-within \.ogui-tooltip__bubble \{[^}]*pointer-events: auto;/,
    );
    expect(css).toMatch(
      /\.ogui-tooltip\[data-dismissed="true"\] \.ogui-tooltip__bubble \{[^}]*pointer-events: none;/,
    );
    // The bridges never paint: no background, border or shadow of their own.
    const bridge = css.match(
      /\.ogui-tooltip::before,\s*\.ogui-tooltip__bubble::before\s*\{([^}]*)\}/,
    );
    expect(bridge?.[1]).not.toMatch(/background|border|box-shadow/);
  });
});
