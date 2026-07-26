export type {
  AsyncMapOptions,
  OpticsCacheStats,
} from "./cache";
export {
  generateDisplacementMapAsync,
  OpticsMapCache,
} from "./cache";
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
  GlassAppearance,
  GlassAppearancePreference,
  GlassContrast,
  GlassRadius,
  GlassThemeInput,
  GlassThemePalette,
  GlassThemePreset,
  GlassThemeTokens,
} from "./theme";
export {
  contrastRatio,
  createGlassTheme,
  createGlassThemeTokens,
  readableForeground,
  relativeLuminance,
} from "./theme";
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
