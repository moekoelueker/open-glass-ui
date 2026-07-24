// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Glass, GlassGroup, GlassProvider, GlassSource } from "./index";

describe("pointer motion path", () => {
  let frameCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    frameCallbacks = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  it("updates transient CSS variables without rerendering React children", () => {
    let renders = 0;

    function Child() {
      renders += 1;
      return <span>Child</span>;
    }

    const view = render(
      <GlassProvider motion="on">
        <Glass interactive>
          <Child />
        </Glass>
      </GlassProvider>,
    );
    const glass = view.container.querySelector<HTMLElement>("[data-prism-glass]");

    expect(glass).not.toBeNull();
    vi.spyOn(glass as HTMLElement, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(glass as HTMLElement, { clientX: 175, clientY: 25 });
    frameCallbacks.shift()?.(0);

    expect(renders).toBe(1);
    expect(glass?.style.getPropertyValue("--prism-pointer-x")).not.toBe("0");
    expect(glass?.style.getPropertyValue("--prism-pointer-y")).not.toBe("0");
  });

  it("cancels a scheduled frame during unmount", () => {
    const view = render(
      <GlassProvider motion="on">
        <Glass interactive>Glass</Glass>
      </GlassProvider>,
    );
    const glass = view.container.querySelector<HTMLElement>("[data-prism-glass]");
    vi.spyOn(glass as HTMLElement, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(glass as HTMLElement, { clientX: 80, clientY: 20 });
    view.unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});

describe("glass source groups", () => {
  it("connects a stable group ID to its owned source", () => {
    const view = render(
      <GlassGroup id="media deck">
        <GlassSource>Source</GlassSource>
      </GlassGroup>,
    );

    expect(
      view.container.querySelector("[data-prism-group]")?.getAttribute("data-prism-group"),
    ).toBe("media-deck");
    expect(
      view.container.querySelector("[data-prism-source]")?.getAttribute("data-prism-source"),
    ).toBe("media-deck");
  });
});
