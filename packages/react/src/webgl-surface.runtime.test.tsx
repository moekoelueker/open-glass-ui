// @vitest-environment jsdom

import { getMaterialPreset } from "@open-glass-ui/core";
import type { RendererCapabilities } from "@open-glass-ui/renderers";
import type { WebGLLens } from "@open-glass-ui/renderers/webgl";
import { act, cleanup, render } from "@testing-library/react";
import type { ReactNode, RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlassProvider } from "./provider";
import { WebGLGlassSurface, type WebGLSource } from "./webgl-surface";

interface FakeRenderer {
  renders: Array<{ source: unknown; lenses: readonly WebGLLens[] }>;
  cleared: number;
  disposed: boolean;
}

const state = vi.hoisted(() => ({
  renderers: [] as FakeRenderer[],
  capabilities: {} as Partial<RendererCapabilities>,
}));

vi.mock("@open-glass-ui/renderers/webgl", () => ({
  WebGLGlassRenderer: class {
    renders: FakeRenderer["renders"] = [];
    cleared = 0;
    disposed = false;
    readonly #onStatusChange: ((status: string) => void) | undefined;

    constructor(
      _canvas: HTMLCanvasElement,
      options: { onStatusChange?: (status: string) => void },
    ) {
      this.#onStatusChange = options.onStatusChange;
      state.renderers.push(this);
      this.#onStatusChange?.("ready");
    }

    resize() {}

    render(source: unknown, lenses: readonly WebGLLens[]) {
      this.renders.push({ source, lenses });
    }

    clear() {
      this.cleared += 1;
    }

    dispose() {
      this.disposed = true;
      this.#onStatusChange?.("disposed");
    }
  },
}));

vi.mock("@open-glass-ui/renderers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@open-glass-ui/renderers")>();
  return {
    ...actual,
    detectRendererCapabilities: () => ({
      backdropFilter: true,
      backdropUrlSyntax: false,
      svgFilterElements: true,
      webgl2: true,
      reducedMotion: false,
      reducedTransparency: false,
      forcedColors: false,
      devicePixelRatio: 1,
      hardwareConcurrency: 8,
      ...state.capabilities,
    }),
  };
});

const mediaListeners = new Set<() => void>();

beforeEach(() => {
  state.renderers.length = 0;
  state.capabilities = {};
  mediaListeners.clear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_type: string, listener: () => void) => mediaListeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => mediaListeners.delete(listener),
    }),
  });
});

afterEach(cleanup);

/** Simulates a media-query change that the provider re-detects capabilities on. */
function changeCapabilities(next: Partial<RendererCapabilities>) {
  state.capabilities = next;
  act(() => {
    for (const listener of mediaListeners) {
      listener();
    }
  });
}

function lens(x: number): WebGLLens {
  return { x, y: 20, width: 120, height: 48, radius: 0.5, material: getMaterialPreset("clear") };
}

function canvasSource(): HTMLCanvasElement {
  // jsdom canvases default to 300 x 150, which counts as renderable.
  return document.createElement("canvas");
}

function Harness({
  sourceRef,
  lenses,
  continuous,
  motion,
  onStatusChange,
}: {
  sourceRef: RefObject<WebGLSource | null>;
  lenses: readonly WebGLLens[];
  continuous?: boolean;
  motion?: "on" | "off";
  onStatusChange?: (status: string, reason?: string) => void;
}): ReactNode {
  return (
    <GlassProvider motion={motion ?? "system"}>
      <WebGLGlassSurface
        data-testid="surface"
        sourceRef={sourceRef}
        lenses={lenses}
        continuous={continuous ?? false}
        {...(onStatusChange ? { onStatusChange } : {})}
      />
    </GlassProvider>
  );
}

function surfaceOf(container: HTMLElement) {
  return container.querySelector("[data-ogui-webgl-surface]") as HTMLCanvasElement;
}

describe("WebGLGlassSurface accessibility gate", () => {
  it.each([
    ["reduced-transparency", { reducedTransparency: true }],
    ["forced-colors", { forcedColors: true }],
    ["webgl2-unavailable", { webgl2: false }],
  ] as const)("reports unavailable for %s and never starts a renderer", (reason, capabilities) => {
    state.capabilities = capabilities;
    const onStatusChange = vi.fn();
    const { container } = render(
      <Harness
        sourceRef={{ current: canvasSource() }}
        lenses={[lens(40)]}
        onStatusChange={onStatusChange}
      />,
    );

    const surface = surfaceOf(container);
    expect(surface.getAttribute("data-ogui-webgl-status")).toBe("unavailable");
    expect(surface.getAttribute("data-ogui-webgl-reason")).toBe(reason);
    expect(surface.style.visibility).toBe("hidden");
    expect(state.renderers).toHaveLength(0);
    expect(onStatusChange).toHaveBeenLastCalledWith("unavailable", reason);
  });

  it("disposes, clears and hides the canvas when a gate turns on, and recovers after", () => {
    const onStatusChange = vi.fn();
    const { container } = render(
      <Harness
        sourceRef={{ current: canvasSource() }}
        lenses={[lens(40)]}
        onStatusChange={onStatusChange}
      />,
    );
    const surface = surfaceOf(container);
    expect(surface.getAttribute("data-ogui-webgl-status")).toBe("ready");
    expect(surface.style.visibility).toBe("");
    const [first] = state.renderers;
    expect(first?.renders.length).toBeGreaterThan(0);

    changeCapabilities({ forcedColors: true });
    expect(first?.cleared).toBe(1);
    expect(first?.disposed).toBe(true);
    expect(surface.getAttribute("data-ogui-webgl-status")).toBe("unavailable");
    expect(surface.getAttribute("data-ogui-webgl-reason")).toBe("forced-colors");
    expect(surface.style.visibility).toBe("hidden");
    expect(onStatusChange).toHaveBeenLastCalledWith("unavailable", "forced-colors");

    changeCapabilities({});
    expect(state.renderers).toHaveLength(2);
    expect(state.renderers[1]?.renders.length).toBeGreaterThan(0);
    expect(surface.getAttribute("data-ogui-webgl-status")).toBe("ready");
    expect(surface.hasAttribute("data-ogui-webgl-reason")).toBe(false);
    expect(surface.style.visibility).toBe("");
  });

  it("does not clear the canvas for ordinary teardown", () => {
    const { unmount } = render(
      <Harness sourceRef={{ current: canvasSource() }} lenses={[lens(40)]} />,
    );
    const [renderer] = state.renderers;
    unmount();
    expect(renderer?.disposed).toBe(true);
    expect(renderer?.cleared).toBe(0);
  });
});

describe("WebGLGlassSurface static invalidation", () => {
  it.each([
    ["static", { continuous: false, motion: "on" }],
    ["motion off", { continuous: true, motion: "off" }],
  ] as const)("draws once when the lens set changes (%s)", (_name, options) => {
    const sourceRef = { current: canvasSource() };
    const { rerender } = render(<Harness sourceRef={sourceRef} lenses={[lens(40)]} {...options} />);
    const [renderer] = state.renderers;
    const before = renderer?.renders.length ?? 0;

    rerender(<Harness sourceRef={sourceRef} lenses={[lens(90)]} {...options} />);
    expect(renderer?.renders.length).toBe(before + 1);
    expect(renderer?.renders.at(-1)?.lenses[0]?.x).toBe(90);

    // An equal lens set in a new array is not a change.
    rerender(<Harness sourceRef={sourceRef} lenses={[lens(90)]} {...options} />);
    expect(renderer?.renders.length).toBe(before + 1);
  });

  it("redraws a paused video when its lenses move", () => {
    const video = document.createElement("video");
    Object.defineProperty(video, "readyState", { configurable: true, value: 4 });
    const sourceRef = { current: video };
    const { rerender } = render(<Harness sourceRef={sourceRef} lenses={[lens(40)]} />);
    const [renderer] = state.renderers;
    const before = renderer?.renders.length ?? 0;

    rerender(<Harness sourceRef={sourceRef} lenses={[lens(70)]} />);
    expect(renderer?.renders.length).toBe(before + 1);
    expect(renderer?.renders.at(-1)?.source).toBe(video);
  });

  it("moves readiness listeners to a swapped source element", () => {
    const image = (loaded: boolean) => {
      const element = document.createElement("img");
      let ready = loaded;
      Object.defineProperty(element, "complete", { configurable: true, get: () => ready });
      Object.defineProperty(element, "naturalWidth", {
        configurable: true,
        get: () => (ready ? 640 : 0),
      });
      return { element, load: () => (ready = true) };
    };
    const first = image(false);
    const second = image(false);
    const removed = vi.spyOn(first.element, "removeEventListener");
    const sourceRef: { current: WebGLSource | null } = { current: first.element };
    const lenses = [lens(40)];
    const { rerender } = render(<Harness sourceRef={sourceRef} lenses={lenses} />);
    const [renderer] = state.renderers;
    expect(renderer?.renders).toHaveLength(0);

    sourceRef.current = second.element;
    rerender(<Harness sourceRef={sourceRef} lenses={lenses} />);
    expect(removed).toHaveBeenCalledWith("load", expect.any(Function));
    expect(removed).toHaveBeenCalledWith("loadeddata", expect.any(Function));

    // The old element loading late paints nothing of its own.
    first.load();
    first.element.dispatchEvent(new Event("load"));
    expect(renderer?.renders.every((call) => call.source !== first.element)).toBe(true);

    second.load();
    second.element.dispatchEvent(new Event("load"));
    expect(renderer?.renders.at(-1)?.source).toBe(second.element);
  });
});

/** A ready video whose frame callbacks fire only when the test plays a frame. */
function fakeVideo() {
  const element = document.createElement("video");
  Object.defineProperty(element, "readyState", { configurable: true, value: 4 });
  const pending = new Map<number, () => void>();
  let handle = 0;
  Object.assign(element, {
    requestVideoFrameCallback: (callback: () => void) => {
      handle += 1;
      pending.set(handle, callback);
      return handle;
    },
    cancelVideoFrameCallback: (id: number) => {
      pending.delete(id);
    },
  });
  const playFrame = () => {
    const callbacks = [...pending.values()];
    pending.clear();
    for (const callback of callbacks) {
      callback();
    }
  };
  return { element, pending, playFrame };
}

describe("WebGLGlassSurface video scheduling", () => {
  it("follows a swapped video when its lenses change in the same render", () => {
    const paused = fakeVideo();
    const playing = fakeVideo();
    const sourceRef: { current: WebGLSource | null } = { current: paused.element };
    const { rerender } = render(<Harness sourceRef={sourceRef} lenses={[lens(40)]} />);
    const [renderer] = state.renderers;
    expect(paused.pending.size).toBe(1);

    // The lens effect draws first and already moves the readiness listeners to
    // the new video; the frame loop must still leave the paused one.
    sourceRef.current = playing.element;
    rerender(<Harness sourceRef={sourceRef} lenses={[lens(70)]} />);
    expect(paused.pending.size).toBe(0);
    expect(playing.pending.size).toBe(1);

    const before = renderer?.renders.length ?? 0;
    playing.playFrame();
    playing.playFrame();
    expect(renderer?.renders.length).toBe(before + 2);
    expect(renderer?.renders.at(-1)?.source).toBe(playing.element);
    expect(renderer?.renders.at(-1)?.lenses[0]?.x).toBe(70);
    expect(playing.pending.size).toBe(1);
  });
});
