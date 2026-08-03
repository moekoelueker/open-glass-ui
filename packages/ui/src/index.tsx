"use client";

import {
  GlassProvider,
  type GlassProviderProps,
  GlassThemeProvider,
  type GlassThemeProviderProps,
  useGlassRuntime,
} from "@open-glass-ui/react";
import { ToastProvider, type ToastProviderProps } from "@open-glass-ui/recipes";
import type { ReactNode } from "react";

export * from "@open-glass-ui/core";
export * from "@open-glass-ui/react";
export * from "@open-glass-ui/recipes";
export * from "@open-glass-ui/renderers";

export type GlassSystemThemeProps = Omit<GlassThemeProviderProps, "children">;

export interface GlassSystemProviderProps extends Omit<GlassProviderProps, "children"> {
  children: ReactNode;
  /** Appearance, theme-token, class, style, and HTML props for the theme boundary. */
  theme?: GlassSystemThemeProps;
  /** Global toast queue options. Set to false when the application supplies its own provider. */
  toasts?: Omit<ToastProviderProps, "children"> | false;
}

interface GlassSystemThemeBoundaryProps {
  children: ReactNode;
  theme: GlassSystemThemeProps;
  toasts: Omit<ToastProviderProps, "children"> | false | undefined;
}

function GlassSystemThemeBoundary({ children, theme, toasts }: GlassSystemThemeBoundaryProps) {
  const runtime = useGlassRuntime();
  const content =
    toasts === false ? children : <ToastProvider {...(toasts ?? {})}>{children}</ToastProvider>;

  return (
    <GlassThemeProvider {...(theme ?? {})} data-ogui-motion={runtime.motion}>
      {content}
    </GlassThemeProvider>
  );
}

/**
 * Establishes the runtime capability policy and theme boundary used by
 * OpenGlass UI primitives and recipes.
 */
export function GlassSystemProvider({
  children,
  theme = {},
  toasts,
  ...runtime
}: GlassSystemProviderProps) {
  return (
    <GlassProvider {...runtime}>
      <GlassSystemThemeBoundary theme={theme} toasts={toasts}>
        {children}
      </GlassSystemThemeBoundary>
    </GlassProvider>
  );
}
