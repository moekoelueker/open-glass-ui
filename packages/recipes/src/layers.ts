import { useEffect, useLayoutEffect } from "react";

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Kinds of layered surfaces the recipes open: modal dialogs and drawers,
 * portaled menus and popovers, and tooltips while they are visible.
 */
export type LayerKind = "modal" | "disclosure" | "tooltip";

interface Layer {
  readonly id: string;
  readonly kind: LayerKind;
  /** The portal host for modals and disclosures; the inline wrapper for tooltips. */
  readonly host: HTMLElement;
  /**
   * The open layer whose portal host held this layer's trigger or anchor when
   * it opened, or null for the document. A menu opened from a dialog is owned
   * by the dialog; a dialog opened from a popover is owned by the popover.
   */
  readonly owner: Layer | null;
}

/**
 * Paint order comes from the open order: the first open layer's host sits at
 * the base and every later one two steps above it, so the most recently
 * opened layer paints on top. The host is positioned, which makes it a
 * stacking context: the fixed overlay or surface inside it paints at the
 * host's level whatever its own z-index. Toasts get their own host above
 * every layer (see `TOAST_HOST_Z_INDEX`).
 */
const LAYER_Z_BASE = 80;
const LAYER_Z_STEP = 2;
export const TOAST_HOST_Z_INDEX = 1000;

const stack: Layer[] = [];
const inertBefore = new Map<HTMLElement, boolean>();
let scrollLock: { overflow: string; paddingRight: string } | null = null;

function topModalIndex() {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index]?.kind === "modal") {
      return index;
    }
  }
  return -1;
}

function isDescendant(layer: Layer, ancestor: Layer) {
  for (let owner = layer.owner; owner; owner = owner.owner) {
    if (owner === ancestor) {
      return true;
    }
  }
  return false;
}

/**
 * The layers the user can reach: with a modal open, the topmost modal and
 * the layers it owns (directly or through its menus and popovers); without
 * one, every layer.
 */
function activeLayers() {
  const modal = stack[topModalIndex()];
  if (!modal) {
    return stack;
  }
  return stack.filter((layer) => layer === modal || isDescendant(layer, modal));
}

function ownerOf(anchor: Element | null) {
  if (!anchor) {
    return null;
  }
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const layer = stack[index];
    if (layer && layer.kind !== "tooltip" && layer.host.contains(anchor)) {
      return layer;
    }
  }
  return null;
}

function syncLayers() {
  const body = document.body;
  const modalIndex = topModalIndex();
  const modal = stack[modalIndex];
  const active = new Set(activeLayers());

  // A layer that is not part of the active modal's tree paints below the
  // modal even when it opened later (a controlled menu outside the dialog).
  const modalZ = LAYER_Z_BASE + LAYER_Z_STEP * modalIndex;
  stack.forEach((layer, index) => {
    if (layer.kind === "tooltip") {
      return;
    }
    const z = LAYER_Z_BASE + LAYER_Z_STEP * index;
    layer.host.style.position = "relative";
    layer.host.style.zIndex = String(modal && !active.has(layer) ? Math.min(z, modalZ - 1) : z);
  });

  // The active modal makes everything outside its tree inert: the page, the
  // layers opened before it and any layer it does not own. The toast host
  // stays live so its region keeps announcing and its actions stay usable.
  const nextInert = new Set<HTMLElement>();
  if (modal) {
    const activeHosts = new Set(
      [...active].filter((layer) => layer.kind !== "tooltip").map((layer) => layer.host),
    );
    for (const element of body.children) {
      if (
        element instanceof HTMLElement &&
        element.getAttribute("data-ogui-portal") !== "toast" &&
        !activeHosts.has(element)
      ) {
        nextInert.add(element);
      }
    }
    for (const layer of stack) {
      if (layer.kind !== "tooltip" && !activeHosts.has(layer.host)) {
        nextInert.add(layer.host);
      }
    }
  }
  for (const [element, previous] of inertBefore) {
    if (!nextInert.has(element)) {
      element.inert = previous;
      inertBefore.delete(element);
    }
  }
  for (const element of nextInert) {
    if (!inertBefore.has(element)) {
      inertBefore.set(element, element.inert);
      element.inert = true;
    }
  }

  if (modal && !scrollLock) {
    scrollLock = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbarWidth = Math.max(window.innerWidth - document.documentElement.clientWidth, 0);
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  } else if (!modal && scrollLock) {
    body.style.overflow = scrollLock.overflow;
    body.style.paddingRight = scrollLock.paddingRight;
    scrollLock = null;
  }
}

/**
 * Puts a layer on top of the stack and returns the function that removes it.
 * `anchor` is the element the layer opened from (its trigger, or the focused
 * opener); the open layer containing it becomes the owner. Call it from an
 * effect only: it touches the document.
 */
export function openLayer(id: string, kind: LayerKind, host: HTMLElement, anchor: Element | null) {
  const layer: Layer = { id, kind, host, owner: ownerOf(anchor) };
  stack.push(layer);
  syncLayers();
  return () => {
    const index = stack.indexOf(layer);
    if (index < 0) {
      return;
    }
    stack.splice(index, 1);
    if (kind !== "tooltip") {
      host.style.removeProperty("position");
      host.style.removeProperty("z-index");
    }
    syncLayers();
  };
}

/**
 * Whether the layer is the most recently opened one the user can reach. Only
 * it answers Escape; a layer left behind a modal it does not belong to never
 * does.
 */
export function isTopLayer(id: string) {
  return activeLayers().at(-1)?.id === id;
}

/**
 * Whether the user can reach the layer: it is the active modal, belongs to
 * it, or no modal is open. A layer outside the active modal's tree is inert,
 * so it must not react to presses elsewhere either (a click on a toast would
 * otherwise close a popover and unmount the dialog it owns).
 */
export function isReachableLayer(id: string) {
  return activeLayers().some((layer) => layer.id === id);
}

/** Whether the layer is the most recently opened modal: only it traps Tab. */
export function isTopModal(id: string) {
  return stack[topModalIndex()]?.id === id;
}

function descendantsOf(id: string) {
  const ancestor = stack.find((layer) => layer.id === id);
  if (!ancestor) {
    return [];
  }
  return stack.filter((layer) => layer.kind !== "tooltip" && isDescendant(layer, ancestor));
}

/** Portal hosts of the menus, popovers and dialogs this layer owns. */
export function descendantHosts(id: string) {
  return descendantsOf(id).map((layer) => layer.host);
}

/**
 * Whether a node belongs to a layer this one owns. Outside-press dismissal
 * treats those as inside, so pressing an item of a menu opened from a
 * popover does not close the popover first.
 */
export function isInDescendantLayer(id: string, target: Node) {
  return descendantsOf(id).some((layer) => layer.host.contains(target));
}

/** A snapshot of the open layers, bottom first. For tests and debugging. */
export function getOpenLayers() {
  return stack.map(({ id, kind, owner }) => ({ id, kind, owner: owner?.id ?? null }));
}
