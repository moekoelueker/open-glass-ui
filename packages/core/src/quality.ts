import { clamp, positive } from "./math";
import type { DisplacementMapInput } from "./types";

export type OpticsQuality = "low" | "medium" | "high";

export interface QualityProfile {
  scale: number;
  maximumDimension: number;
  minimumDimension: number;
  dispersionSamples: 1 | 2 | 3;
}

export interface MapDimensions {
  width: number;
  height: number;
}

export const QUALITY_PROFILES: Readonly<Record<OpticsQuality, QualityProfile>> = {
  low: {
    scale: 0.3,
    maximumDimension: 96,
    minimumDimension: 16,
    dispersionSamples: 1,
  },
  medium: {
    scale: 0.55,
    maximumDimension: 192,
    minimumDimension: 24,
    dispersionSamples: 2,
  },
  high: {
    scale: 1,
    maximumDimension: 384,
    minimumDimension: 32,
    dispersionSamples: 3,
  },
};

export function resolveMapDimensions(
  width: number,
  height: number,
  quality: OpticsQuality,
): MapDimensions {
  const profile = QUALITY_PROFILES[quality];
  const safeWidth = positive(width, 1);
  const safeHeight = positive(height, 1);
  const scaledWidth = safeWidth * profile.scale;
  const scaledHeight = safeHeight * profile.scale;
  const largest = Math.max(scaledWidth, scaledHeight);
  const maximumScale = largest > profile.maximumDimension ? profile.maximumDimension / largest : 1;
  const widthAfterMaximum = scaledWidth * maximumScale;
  const heightAfterMaximum = scaledHeight * maximumScale;
  const smallest = Math.min(widthAfterMaximum, heightAfterMaximum);
  const minimumScale =
    smallest < profile.minimumDimension ? profile.minimumDimension / smallest : 1;

  return {
    width: Math.round(
      clamp(widthAfterMaximum * minimumScale, profile.minimumDimension, profile.maximumDimension),
    ),
    height: Math.round(
      clamp(heightAfterMaximum * minimumScale, profile.minimumDimension, profile.maximumDimension),
    ),
  };
}

export function applyQualityToMapInput(
  input: DisplacementMapInput,
  quality: OpticsQuality,
): DisplacementMapInput {
  const dimensions = resolveMapDimensions(input.width, input.height, quality);

  return {
    ...input,
    ...dimensions,
  };
}
