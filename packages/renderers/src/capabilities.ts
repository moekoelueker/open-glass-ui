export type ConcreteRenderer = "css" | "organic-svg" | "sdf-svg" | "webgl2";
export type RendererPreference = "auto" | ConcreteRenderer;
export type RendererSource = "dom" | "media";

export interface RendererCapabilities {
  backdropFilter: boolean;
  backdropUrlSyntax: boolean;
  svgFilterElements: boolean;
  webgl2: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  forcedColors: boolean;
  devicePixelRatio: number;
  hardwareConcurrency: number;
}

export interface CapabilityProbe {
  supports(property: string, value: string): boolean;
  matches(query: string): boolean;
  hasSvgDisplacementElement(): boolean;
  hasWebGL2(): boolean;
  devicePixelRatio: number;
  hardwareConcurrency: number;
}

export interface RendererRequest {
  preference?: RendererPreference;
  source: RendererSource;
  capabilities: RendererCapabilities;
}

export interface RendererDecision {
  renderer: ConcreteRenderer;
  reason: "explicit" | "accessibility-fallback" | "media-webgl" | "dom-svg" | "capability-fallback";
}

const SERVER_CAPABILITIES: RendererCapabilities = {
  backdropFilter: false,
  backdropUrlSyntax: false,
  svgFilterElements: false,
  webgl2: false,
  reducedMotion: false,
  reducedTransparency: false,
  forcedColors: false,
  devicePixelRatio: 1,
  hardwareConcurrency: 1,
};

function createBrowserProbe(): CapabilityProbe | undefined {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }

  return {
    supports(property, value) {
      return typeof CSS !== "undefined" && CSS.supports(property, value);
    },
    matches(query) {
      return window.matchMedia(query).matches;
    },
    hasSvgDisplacementElement() {
      const element = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
      return element.localName === "feDisplacementMap";
    },
    hasWebGL2() {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
      });

      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return context !== null;
    },
    devicePixelRatio: Math.max(window.devicePixelRatio || 1, 1),
    hardwareConcurrency: Math.max(window.navigator.hardwareConcurrency || 1, 1),
  };
}

export function detectRendererCapabilities(
  probe: CapabilityProbe | undefined = createBrowserProbe(),
): RendererCapabilities {
  if (!probe) {
    return { ...SERVER_CAPABILITIES };
  }

  return {
    backdropFilter:
      probe.supports("backdrop-filter", "blur(1px)") ||
      probe.supports("-webkit-backdrop-filter", "blur(1px)"),
    backdropUrlSyntax:
      probe.supports("backdrop-filter", 'url("#prism-capability-probe")') ||
      probe.supports("-webkit-backdrop-filter", 'url("#prism-capability-probe")'),
    svgFilterElements: probe.hasSvgDisplacementElement(),
    webgl2: probe.hasWebGL2(),
    reducedMotion: probe.matches("(prefers-reduced-motion: reduce)"),
    reducedTransparency: probe.matches("(prefers-reduced-transparency: reduce)"),
    forcedColors: probe.matches("(forced-colors: active)"),
    devicePixelRatio: probe.devicePixelRatio,
    hardwareConcurrency: probe.hardwareConcurrency,
  };
}

function isSupported(
  renderer: ConcreteRenderer,
  source: RendererSource,
  capabilities: RendererCapabilities,
) {
  switch (renderer) {
    case "css":
      return true;
    case "organic-svg":
    case "sdf-svg":
      return capabilities.svgFilterElements;
    case "webgl2":
      return source === "media" && capabilities.webgl2;
  }
}

export function selectRenderer(request: RendererRequest): RendererDecision {
  const preference = request.preference ?? "auto";
  const { capabilities, source } = request;

  if (capabilities.forcedColors || capabilities.reducedTransparency) {
    return { renderer: "css", reason: "accessibility-fallback" };
  }

  if (preference !== "auto") {
    return isSupported(preference, source, capabilities)
      ? { renderer: preference, reason: "explicit" }
      : { renderer: "css", reason: "capability-fallback" };
  }

  if (source === "media" && capabilities.webgl2) {
    return { renderer: "webgl2", reason: "media-webgl" };
  }

  if (source === "dom" && capabilities.svgFilterElements) {
    return { renderer: "sdf-svg", reason: "dom-svg" };
  }

  return { renderer: "css", reason: "capability-fallback" };
}
