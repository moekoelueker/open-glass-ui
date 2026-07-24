import type { OpticsQuality } from "@prism-lab/core";
import {
  detectRendererCapabilities,
  type RendererCapabilities,
  type RendererPreference,
} from "@prism-lab/renderers";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type GlassMotionPreference = "system" | "on" | "off";
export type GlassQualityPreference = "auto" | OpticsQuality;

export interface GlassProviderProps {
  children: ReactNode;
  renderer?: RendererPreference;
  quality?: GlassQualityPreference;
  motion?: GlassMotionPreference;
}

export interface GlassRuntime {
  capabilities: RendererCapabilities;
  renderer: RendererPreference;
  quality: OpticsQuality;
  motion: "on" | "off";
  hydrated: boolean;
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

const DEFAULT_RUNTIME: GlassRuntime = {
  capabilities: SERVER_CAPABILITIES,
  renderer: "auto",
  quality: "low",
  motion: "on",
  hydrated: false,
};

const GlassRuntimeContext = createContext<GlassRuntime>(DEFAULT_RUNTIME);

function resolveQuality(
  preference: GlassQualityPreference,
  capabilities: RendererCapabilities,
): OpticsQuality {
  if (preference !== "auto") {
    return preference;
  }

  if (
    capabilities.forcedColors ||
    capabilities.reducedTransparency ||
    capabilities.hardwareConcurrency <= 4
  ) {
    return "low";
  }

  return "medium";
}

function resolveMotion(
  preference: GlassMotionPreference,
  capabilities: RendererCapabilities,
): "on" | "off" {
  if (preference === "off") {
    return "off";
  }
  if (preference === "on") {
    return "on";
  }
  return capabilities.reducedMotion ? "off" : "on";
}

export function GlassProvider({
  children,
  renderer = "auto",
  quality = "auto",
  motion = "system",
}: GlassProviderProps) {
  const [capabilities, setCapabilities] = useState(SERVER_CAPABILITIES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const mediaQueries =
      typeof window.matchMedia === "function"
        ? [
            window.matchMedia("(prefers-reduced-motion: reduce)"),
            window.matchMedia("(prefers-reduced-transparency: reduce)"),
            window.matchMedia("(forced-colors: active)"),
          ]
        : [];
    const update = () => {
      setCapabilities(detectRendererCapabilities());
      setHydrated(true);
    };

    update();
    for (const query of mediaQueries) {
      query.addEventListener("change", update);
    }

    return () => {
      for (const query of mediaQueries) {
        query.removeEventListener("change", update);
      }
    };
  }, []);

  const value = useMemo<GlassRuntime>(
    () => ({
      capabilities,
      renderer,
      quality: resolveQuality(quality, capabilities),
      motion: resolveMotion(motion, capabilities),
      hydrated,
    }),
    [capabilities, hydrated, motion, quality, renderer],
  );

  return <GlassRuntimeContext.Provider value={value}>{children}</GlassRuntimeContext.Provider>;
}

export function useGlassRuntime() {
  return useContext(GlassRuntimeContext);
}

export function useGlassCapabilities() {
  return useGlassRuntime().capabilities;
}
