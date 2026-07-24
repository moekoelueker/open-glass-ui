import type { DisplacementMap, GlassMaterial } from "@prism-lab/core";

export interface Canvas2DLike {
  width: number;
  height: number;
  getContext(contextId: "2d"): {
    createImageData(width: number, height: number): ImageData;
    putImageData(imageData: ImageData, x: number, y: number): void;
  } | null;
  toDataURL(type?: string): string;
}

export type CanvasFactory = () => Canvas2DLike;

export interface SvgDisplacementFilterSpec {
  id: string;
  href: string;
  x: string;
  y: string;
  width: string;
  height: string;
  redScale: number;
  greenScale: number;
  blueScale: number;
  specularOpacity: number;
}

function defaultCanvasFactory(): Canvas2DLike {
  if (typeof document === "undefined") {
    throw new Error("Encoding a displacement map requires a browser canvas.");
  }

  return document.createElement("canvas");
}

function fnv1a(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

function safeId(value: string) {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || "prism-filter";
}

export function createStableFilterId(base: string, cacheKey: string) {
  return `${safeId(base)}-${fnv1a(cacheKey)}`;
}

export function encodeDisplacementMap(
  map: DisplacementMap,
  canvasFactory: CanvasFactory = defaultCanvasFactory,
) {
  const canvas = canvasFactory();
  canvas.width = map.width;
  canvas.height = map.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("A 2D canvas context is required to encode the displacement map.");
  }

  const imageData = context.createImageData(map.width, map.height);
  imageData.data.set(map.data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function createSvgDisplacementFilterSpec(
  baseId: string,
  map: DisplacementMap,
  mapUrl: string,
  material: GlassMaterial,
): SvgDisplacementFilterSpec {
  const baseScale = Math.max(map.width, map.height) * map.maxDisplacement * 0.42;
  const dispersion = material.dispersion * 9;

  return {
    id: createStableFilterId(baseId, map.cacheKey),
    href: mapUrl,
    x: "-18%",
    y: "-18%",
    width: "136%",
    height: "136%",
    redScale: baseScale * (1 + dispersion),
    greenScale: baseScale,
    blueScale: baseScale * (1 - dispersion),
    specularOpacity: material.edgeStrength,
  };
}
