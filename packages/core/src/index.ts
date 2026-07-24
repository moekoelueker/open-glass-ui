export { createOpticsCacheKey, generateDisplacementMap } from "./displacement";
export { signedDistance, surfaceHeight, surfaceNormal } from "./geometry";
export { getMaterialPreset, sanitizeMaterial } from "./materials";
export type { MapDimensions, OpticsQuality, QualityProfile } from "./quality";
export {
  applyQualityToMapInput,
  QUALITY_PROFILES,
  resolveMapDimensions,
} from "./quality";
export type {
  DisplacementMap,
  DisplacementMapInput,
  GlassMaterial,
  LensGeometry,
  LensShapeKind,
  MaterialPresetName,
  Point2D,
  SurfaceNormal,
} from "./types";
