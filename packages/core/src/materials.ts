import { clamp, finite } from "./math";
import type { GlassMaterial, MaterialPresetName } from "./types";

const MATERIAL_PRESETS: Record<MaterialPresetName, GlassMaterial> = {
  regular: {
    thickness: 0.62,
    ior: 1.46,
    dispersion: 0.012,
    edgeStrength: 0.46,
    bevel: 0.68,
    frost: 0.24,
  },
  clear: {
    thickness: 0.78,
    ior: 1.5,
    dispersion: 0.018,
    edgeStrength: 0.54,
    bevel: 0.76,
    frost: 0.04,
  },
  frosted: {
    thickness: 0.44,
    ior: 1.4,
    dispersion: 0.006,
    edgeStrength: 0.36,
    bevel: 0.58,
    frost: 0.66,
  },
};

export function sanitizeMaterial(material: GlassMaterial): GlassMaterial {
  return {
    thickness: clamp(finite(material.thickness, 0.62), 0, 1.5),
    ior: clamp(finite(material.ior, 1.46), 1, 2.5),
    dispersion: clamp(finite(material.dispersion, 0.012), 0, 0.08),
    edgeStrength: clamp(finite(material.edgeStrength, 0.46), 0, 1),
    bevel: clamp(finite(material.bevel, 0.68), 0.05, 1),
    frost: clamp(finite(material.frost, 0.24), 0, 1),
  };
}

export function getMaterialPreset(name: MaterialPresetName): GlassMaterial {
  return { ...MATERIAL_PRESETS[name] };
}
