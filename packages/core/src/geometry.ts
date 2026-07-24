import { clamp, finite, normalize3, positive } from "./math";
import type { LensGeometry, Point2D, SurfaceNormal } from "./types";

interface SanitizedGeometry {
  kind: LensGeometry["kind"];
  width: number;
  height: number;
  cornerRadius: number;
  exponent: number;
}

function sanitizeGeometry(geometry: LensGeometry): SanitizedGeometry {
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

function circleDistance(point: Point2D, geometry: SanitizedGeometry) {
  return Math.hypot(point.x, point.y) - Math.min(geometry.width, geometry.height) / 2;
}

function capsuleDistance(point: Point2D, geometry: SanitizedGeometry) {
  const radius = Math.min(geometry.width, geometry.height) / 2;

  if (geometry.width >= geometry.height) {
    const halfSegment = geometry.width / 2 - radius;
    const closestX = clamp(point.x, -halfSegment, halfSegment);
    return Math.hypot(point.x - closestX, point.y) - radius;
  }

  const halfSegment = geometry.height / 2 - radius;
  const closestY = clamp(point.y, -halfSegment, halfSegment);
  return Math.hypot(point.x, point.y - closestY) - radius;
}

function roundedRectDistance(point: Point2D, geometry: SanitizedGeometry) {
  const halfWidth = geometry.width / 2;
  const halfHeight = geometry.height / 2;
  const radius = geometry.cornerRadius;
  const qx = Math.abs(point.x) - (halfWidth - radius);
  const qy = Math.abs(point.y) - (halfHeight - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);

  return outside + inside - radius;
}

function superellipseDistance(point: Point2D, geometry: SanitizedGeometry) {
  const halfWidth = geometry.width / 2;
  const halfHeight = geometry.height / 2;
  const nx = Math.abs(point.x) / halfWidth;
  const ny = Math.abs(point.y) / halfHeight;
  const implicitRadius =
    (nx ** geometry.exponent + ny ** geometry.exponent) ** (1 / geometry.exponent);

  return (implicitRadius - 1) * Math.min(halfWidth, halfHeight);
}

export function signedDistance(point: Point2D, geometry: LensGeometry) {
  const sanitized = sanitizeGeometry(geometry);
  const safePoint = {
    x: finite(point.x, 0),
    y: finite(point.y, 0),
  };

  switch (sanitized.kind) {
    case "circle":
      return circleDistance(safePoint, sanitized);
    case "capsule":
      return capsuleDistance(safePoint, sanitized);
    case "rounded-rect":
      return roundedRectDistance(safePoint, sanitized);
    case "superellipse":
      return superellipseDistance(safePoint, sanitized);
  }
}

export function surfaceHeight(point: Point2D, geometry: LensGeometry, thickness: number) {
  const safeThickness = clamp(finite(thickness, 0.6), 0, 1.5);
  const minimumDimension = Math.min(positive(geometry.width, 1), positive(geometry.height, 1));
  const maximumInteriorDistance = Math.max(-signedDistance({ x: 0, y: 0 }, geometry), 1);
  const interiorDistance = Math.max(-signedDistance(point, geometry), 0);
  const normalizedInterior = clamp(interiorDistance / maximumInteriorDistance, 0, 1);
  const profile = Math.sin((normalizedInterior * Math.PI) / 2);

  return profile * minimumDimension * 0.18 * safeThickness;
}

export function surfaceNormal(
  point: Point2D,
  geometry: LensGeometry,
  thickness: number,
): SurfaceNormal {
  const minimumDimension = Math.min(positive(geometry.width, 1), positive(geometry.height, 1));
  const step = Math.max(minimumDimension / 256, 0.25);
  const left = surfaceHeight({ x: point.x - step, y: point.y }, geometry, thickness);
  const right = surfaceHeight({ x: point.x + step, y: point.y }, geometry, thickness);
  const top = surfaceHeight({ x: point.x, y: point.y - step }, geometry, thickness);
  const bottom = surfaceHeight({ x: point.x, y: point.y + step }, geometry, thickness);
  const dx = (right - left) / (2 * step);
  const dy = (bottom - top) / (2 * step);

  return normalize3(-dx, -dy, 1);
}
