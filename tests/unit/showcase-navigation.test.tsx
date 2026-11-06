// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../apps/showcase/src/app";

// The atlas route renders only once the test opens this gate, like a lazy
// chunk that is slow to arrive.
const gate = vi.hoisted(() => ({ promise: Promise.resolve(), release: () => {} }));

function closeGate() {
  gate.promise = new Promise<void>((resolve) => {
    gate.release = resolve;
  });
}

vi.mock("../../apps/showcase/src/landing-page", async () => {
  const { createElement } = await import("react");
  const { AppLink } = await import("../../apps/showcase/src/navigation");
  return {
    LandingPage: () =>
      createElement(
        "main",
        null,
        createElement(AppLink, { href: "/components#atlas-dialog" }, "Open the dialog specimen"),
      ),
  };
});

vi.mock("../../apps/showcase/src/component-atlas", async () => {
  const { createElement, use } = await import("react");
  return {
    ComponentAtlasHome: () => null,
    ComponentAtlasPage: function GatedAtlas() {
      use(gate.promise);
      return createElement("main", null, createElement("h2", { id: "atlas-dialog" }, "Dialog"));
    },
  };
});

const scrolledTo: Element[] = [];
// The clock only ever moves forward, also across tests: React's scheduler
// reads it too and must never see time run backwards.
let skew = 0;

beforeAll(() => {
  const realNow = performance.now.bind(performance);
  vi.spyOn(performance, "now").mockImplementation(() => realNow() + skew);
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  scrolledTo.length = 0;
  Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
    scrolledTo.push(this);
  };
});

afterEach(() => {
  cleanup();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  window.history.replaceState(null, "", "/");
});

/** Lets a few animation frames run, so a pending hash lookup ticks. */
async function frames() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
}

// The route suspends inside these, so they run in an awaited act scope, as
// React asks for; from a synchronous one its retry was not reliably flushed.
async function renderApp() {
  await act(async () => {
    render(<App />);
  });
}

async function openDialogLink() {
  await act(async () => {
    screen.getByRole("link", { name: "Open the dialog specimen" }).click();
  });
}

/** The route is still loading long after the lookup budget would have run out. */
async function slowChunk() {
  await frames();
  skew += 2500;
  await frames();
  await act(async () => gate.release());
  await screen.findByRole("heading", { name: "Dialog" });
  await frames();
}

describe("showcase hash scrolling", () => {
  it("finds a deep link's anchor once a slow lazy route has loaded", async () => {
    window.history.replaceState(null, "", "/components#atlas-dialog");
    closeGate();
    await renderApp();
    expect(screen.getByRole("status").textContent).toContain("Loading OpenGlass UI");

    await slowChunk();
    expect(scrolledTo).toEqual([screen.getByRole("heading", { name: "Dialog" })]);
  });

  it("finds the anchor of an in-app link once its slow route has loaded", async () => {
    closeGate();
    await renderApp();
    await openDialogLink();
    expect(window.location.pathname + window.location.hash).toBe("/components#atlas-dialog");

    await slowChunk();
    expect(scrolledTo).toEqual([screen.getByRole("heading", { name: "Dialog" })]);
  });

  it("drops the scroll when the reader scrolls while the route loads", async () => {
    closeGate();
    await renderApp();
    await openDialogLink();
    await frames();
    fireEvent.wheel(window);

    await act(async () => gate.release());
    await screen.findByRole("heading", { name: "Dialog" });
    await frames();
    expect(scrolledTo).toEqual([]);
  });
});
