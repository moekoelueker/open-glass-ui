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
export type {
  GlassLook,
  GlassLookInput,
  GlassLookPreset,
  GlassLookTokens,
} from "./look";
export {
  createGlassLookTokens,
  DEFAULT_GLASS_LIGHT_ANGLE,
  DEFAULT_GLASS_LIGHT_SPREAD,
  GLASS_LOOK_PRESETS,
  resolveGlassLook,
} from "./look";
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
  GlassDesign,
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
