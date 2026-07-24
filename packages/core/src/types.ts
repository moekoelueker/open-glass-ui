export interface Point2D {
  x: number;
  y: number;
}

export interface SurfaceNormal {
  x: number;
  y: number;
  z: number;
}

export type LensShapeKind = "circle" | "capsule" | "rounded-rect" | "superellipse";

export interface LensGeometry {
  kind: LensShapeKind;
  width: number;
  height: number;
  cornerRadius?: number;
  exponent?: number;
}

export type MaterialPresetName = "regular" | "clear" | "frosted";

export interface GlassMaterial {
  thickness: number;
  ior: number;
  dispersion: number;
  edgeStrength: number;
  bevel: number;
  frost: number;
}

export interface DisplacementMapInput {
  width: number;
  height: number;
  geometry: LensGeometry;
  material: GlassMaterial;
}

export interface DisplacementMap {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  cacheKey: string;
  maxDisplacement: number;
}
