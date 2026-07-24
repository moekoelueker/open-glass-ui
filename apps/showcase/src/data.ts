export type EngineId = "css" | "organic" | "sdf" | "webgl" | "hybrid";

export interface ExperimentDefinition {
  id: EngineId;
  index: string;
  title: string;
  shortTitle: string;
  thesis: string;
  method: string;
  artDirection: string;
  renderer: string;
  fallback: string;
  strengths: readonly string[];
  limitation: string;
  finalScore: number;
  accent: string;
}

export const EXPERIMENTS: readonly ExperimentDefinition[] = [
  {
    id: "css",
    index: "01",
    title: "Layered CSS Material",
    shortTitle: "CSS Material",
    thesis: "The reliable baseline: clarity through layered translucency, not fake physics.",
    method: "Backdrop blur, saturation, luminosity tint, edge light, and content-aware dimming.",
    artDirection: "Warm editorial atelier",
    renderer: "CSS backdrop-filter",
    fallback: "Opaque semantic material",
    strengths: ["Broad support", "Native DOM", "Low overhead"],
    limitation: "Blur and tint cannot reproduce directional refraction.",
    finalScore: 93,
    accent: "#ef5b3d",
  },
  {
    id: "organic",
    index: "02",
    title: "Organic SVG Engine",
    shortTitle: "Organic SVG",
    thesis: "A deliberately fluid surface with a living rim and a quiet, legible core.",
    method: "Turbulence-driven SVG displacement, viscous flow, and separated highlight layers.",
    artDirection: "Mineral bioluminescence",
    renderer: "SVG turbulence filter",
    fallback: "Static CSS material",
    strengths: ["Expressive shape", "DOM-native", "Procedural flow"],
    limitation: "Filter behavior and cost vary more across browser engines.",
    finalScore: 85,
    accent: "#d6ff42",
  },
  {
    id: "sdf",
    index: "03",
    title: "Geometric SDF Engine",
    shortTitle: "Geometric SDF",
    thesis: "Deterministic optical geometry turns glass into a precise instrument.",
    method: "Signed-distance normals encoded into stable RGB displacement maps with edge response.",
    artDirection: "Calibrated optical laboratory",
    renderer: "Generated map + SVG filter",
    fallback: "Layered CSS material",
    strengths: ["Deterministic", "Cacheable", "Shape-coherent"],
    limitation: "DOM refraction remains constrained by SVG backdrop behavior.",
    finalScore: 88,
    accent: "#ffb547",
  },
  {
    id: "webgl",
    index: "04",
    title: "WebGL2 Optical Engine",
    shortTitle: "WebGL2 Optics",
    thesis: "Controlled media enables the strongest illusion: coherent refraction at every pixel.",
    method:
      "Multi-lens shader with SDF normals, IOR, spectral dispersion, frost, and Fresnel edges.",
    artDirection: "Cinematic spectral chamber",
    renderer: "WebGL2 texture renderer",
    fallback: "Source media + CSS controls",
    strengths: ["Best refraction", "Shared multi-lens source", "Video-ready"],
    limitation: "Cannot sample arbitrary DOM and needs explicit GPU lifecycle care.",
    finalScore: 88,
    accent: "#ff4f45",
  },
  {
    id: "hybrid",
    index: "05",
    title: "Adaptive Hybrid Engine",
    shortTitle: "Adaptive Hybrid",
    thesis:
      "A production system chooses the safest high-quality renderer for each source and user.",
    method:
      "Capability policy, shared sources, quality tiers, contrast modes, and stable fallbacks.",
    artDirection: "Obsidian production console",
    renderer: "CSS / SVG / WebGL2 policy",
    fallback: "Forced-colors-safe opaque material",
    strengths: ["Resilient", "Accessible", "Production-oriented"],
    limitation: "A broader system requires disciplined testing and explicit source ownership.",
    finalScore: 96,
    accent: "#f2c14e",
  },
] as const;

export const ENVIRONMENTS = ["light", "dark", "noise", "chroma", "photo", "motion"] as const;
export type EnvironmentId = (typeof ENVIRONMENTS)[number];

export const ENVIRONMENT_LABELS: Record<EnvironmentId, string> = {
  light: "Daylight",
  dark: "Shadow",
  noise: "Noise",
  chroma: "Chroma",
  photo: "Photo",
  motion: "Motion",
};

export function getExperiment(id: string | undefined) {
  return EXPERIMENTS.find((experiment) => experiment.id === id);
}
