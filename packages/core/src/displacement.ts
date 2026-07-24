import { signedDistance, surfaceNormal } from "./geometry";
import { sanitizeMaterial } from "./materials";
import { clamp, finite, positive } from "./math";
import type { DisplacementMap, DisplacementMapInput, LensGeometry } from "./types";

function mapDimension(value: number) {
  return Math.round(clamp(positive(value, 1), 1, 4096));
}

function normalizedGeometry(geometry: LensGeometry): Required<LensGeometry> {
  const width = positive(geometry.width, 1);
  const height = positive(geometry.height, 1);
  const maximumRadius = Math.min(width, height) / 2;

  return {
    kind: geometry.kind,
    width,
    height,
    cornerRadius: clamp(
      positive(geometry.cornerRadius ?? maximumRadius * 0.25, 1),
      0,
      maximumRadius,
    ),
    exponent: clamp(positive(geometry.exponent ?? 4, 4), 2, 16),
  };
}

function rounded(value: number) {
  return Number(finite(value, 0).toFixed(6));
}

export function createOpticsCacheKey(input: DisplacementMapInput): string {
  const geometry = normalizedGeometry(input.geometry);
  const material = sanitizeMaterial(input.material);

  return JSON.stringify([
    "prism-map-v1",
    mapDimension(input.width),
    mapDimension(input.height),
    geometry.kind,
    rounded(geometry.width),
    rounded(geometry.height),
    rounded(geometry.cornerRadius),
    rounded(geometry.exponent),
    rounded(material.thickness),
    rounded(material.ior),
    rounded(material.dispersion),
    rounded(material.edgeStrength),
    rounded(material.bevel),
    rounded(material.frost),
  ]);
}

function smoothMask(distance: number, antialiasWidth: number) {
  const linear = clamp(0.5 - distance / Math.max(antialiasWidth * 2, 0.0001), 0, 1);
  return linear * linear * (3 - 2 * linear);
}

function channel(value: number) {
  return Math.round(clamp(value, 0, 1) * 255);
}

function vectorChannel(value: number) {
  return Math.round(128 + clamp(value, -1, 1) * 127);
}

export function generateDisplacementMap(input: DisplacementMapInput): DisplacementMap {
  const width = mapDimension(input.width);
  const height = mapDimension(input.height);
  const geometry = normalizedGeometry(input.geometry);
  const material = sanitizeMaterial(input.material);
  const data = new Uint8ClampedArray(width * height * 4);
  const xScale = geometry.width / width;
  const yScale = geometry.height / height;
  const antialiasWidth = Math.max(xScale, yScale) * 0.8;
  const minimumDimension = Math.min(geometry.width, geometry.height);
  const bevelDepth = Math.max(minimumDimension * material.bevel * 0.48, antialiasWidth);
  const refractionStrength = ((material.ior - 1) / material.ior) * material.thickness * 2.2;
  let maxDisplacement = 0;

  for (let y = 0; y < height; y += 1) {
    const geometryY = (y + 0.5 - height / 2) * yScale;

    for (let x = 0; x < width; x += 1) {
      const geometryX = (x + 0.5 - width / 2) * xScale;
      const offset = (y * width + x) * 4;
      const point = { x: geometryX, y: geometryY };
      const distance = signedDistance(point, geometry);
      const mask = smoothMask(distance, antialiasWidth);

      if (mask <= 0) {
        data[offset] = 128;
        data[offset + 1] = 128;
        data[offset + 2] = 0;
        data[offset + 3] = 0;
        continue;
      }

      const normal = surfaceNormal(point, geometry, material.thickness);
      const displacementX = normal.x * refractionStrength * mask;
      const displacementY = normal.y * refractionStrength * mask;
      const displacementMagnitude = Math.hypot(displacementX, displacementY);
      const interiorDistance = Math.max(-distance, 0);
      const edgeProximity = 1 - clamp(interiorDistance / bevelDepth, 0, 1);
      const fresnel = (1 - normal.z) ** 2;
      const specular = clamp(
        (edgeProximity * 0.24 + fresnel * 5.5) * material.edgeStrength * mask,
        0,
        1,
      );

      maxDisplacement = Math.max(maxDisplacement, displacementMagnitude);
      data[offset] = vectorChannel(displacementX);
      data[offset + 1] = vectorChannel(displacementY);
      data[offset + 2] = channel(specular);
      data[offset + 3] = channel(mask);
    }
  }

  return {
    width,
    height,
    data,
    cacheKey: createOpticsCacheKey({ width, height, geometry, material }),
    maxDisplacement,
  };
}
