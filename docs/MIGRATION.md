# Migration to OpenGlass UI

This guide covers migration from a local renderer prototype or from direct
workspace-package imports to the published `open-glass-ui` package. Install it
from npm rather than referencing any `@open-glass-ui/*` path: those packages are
private build-time boundaries and do not exist on the registry.

## Upgrading from 0.3 to 0.4 (liquid design)

0.4 changes how components look, not how you use them. A `^0.3.0` range
never resolves to 0.4, so nothing changes until you upgrade on purpose.

**Keep the 0.3 look exactly** with one prop:

```tsx
<GlassSystemProvider design="classic">{children}</GlassSystemProvider>
// or, when composing the providers yourself:
<GlassThemeProvider design="classic">{children}</GlassThemeProvider>
```

**Adopt liquid gradually** by nesting scopes. The nearest scope wins:

```tsx
<GlassSystemProvider design="classic">
  <LegacyApp />
  <GlassThemeProvider design="liquid">
    <NewFeature />
  </GlassThemeProvider>
</GlassSystemProvider>
```

What to check when you switch to liquid:

- **Corners.** Liquid defaults to the `soft` radius scale and pill-shaped
  controls. Pass `theme={{ radius: "balanced" }}` for the previous corner
  sizes, or `radius: "sharp"` to keep controls rectangular.
- **Tabs.** The underline becomes a capsule tab list with a sliding thumb.
- **CSS overrides.** Liquid rules share the specificity of the classic rules
  they replace, so your overrides still win. If you restyled a component with
  `box-shadow` or `background`, check it: liquid uses both for the rim and
  glint.
- **Borders and pseudo-elements on `Glass`.** Liquid draws the lit edge as a
  ring in `::after` and collapses the painted border, so the edge is a single
  clean line. If your `Glass` uses `::after`, or you want a real border, pass
  `data-ogui-rim="off"` or `style={{ borderWidth }}`.
- **Art direction.** `theme={{ glass: "frosted" }}` (or `clear`, `smoked`,
  `lensed`, or individual multipliers) re-tunes every surface; see THEMING.md.
- **Custom palettes.** `GlassThemePalette.radiusCapsule` is new and optional.
  Omit it and the capsule token falls back to `999px`.
- **CSS-only use.** Liquid styling needs a `data-ogui-design="liquid"`
  ancestor, which the providers render. Markup that uses the recipe class
  names without a provider keeps the classic look.

## 1. Use the public facade

Replace consumer imports from internal workspace packages with the public
entry:

```diff
- import { Glass } from "@open-glass-ui/react";
- import { Button } from "@open-glass-ui/recipes";
+ import { Button, Glass } from "open-glass-ui";
```

Internal `@open-glass-ui/*` packages remain public only because the facade needs
them as its dependency chain. Application code and code-generating agents
should not depend on those boundaries.

## 2. Import recipe CSS once

Import the public stylesheet near the application root:

```ts
import "open-glass-ui/styles.css";
```

Remove application imports that reach into a recipe package's source or
distribution folders.

## 3. Adopt the combined provider

`GlassSystemProvider` is the preferred application boundary. It combines
runtime capability policy, theme tokens, and the global toast queue:

```tsx
import { GlassSystemProvider } from "open-glass-ui";
import type { ReactNode } from "react";

export function OpenGlassRoot({ children }: { children: ReactNode }) {
  return (
    <GlassSystemProvider
      renderer="auto"
      quality="auto"
      motion="system"
      theme={{
        appearance: "system",
        defaultAppearance: "dark",
        theme: { preset: "neutral", contrast: "high", radius: "balanced" },
      }}
    >
      {children}
    </GlassSystemProvider>
  );
}
```

The lower-level `GlassProvider`, `GlassThemeProvider`, and `ToastProvider`
remain available when an application needs separate boundaries.

## 4. Treat `auto` as CSS-first

Do not rely on capability detection to promote an arbitrary DOM surface to SVG
or WebGL:

- use `renderer="auto"` or `renderer="css"` for ordinary UI;
- opt into `sdf-svg` or `organic-svg` only for a compatible owned/supplied DOM
  surface; and
- import `WebGLGlassSurface` from `open-glass-ui/webgl` only for an owned image,
  canvas, or video.

Keep original media, text, controls, semantics, and no-enhancement fallbacks in
the DOM.

## 5. Move to semantic neutral tokens

The default is adaptive neutral light/dark, not a fixed green brand palette.
Use theme input or public `--ogui-*` tokens instead of implementation colors:

```tsx
<GlassSystemProvider
  theme={{
    appearance: "system",
    theme: {
      preset: "neutral",
      accent: "#2057d4",
      secondary: "#47678f",
      tertiary: "#8a5c20",
    },
  }}
>
  {children}
</GlassSystemProvider>
```

When overriding status colors, preserve the complete foreground/background
pairs: danger/danger-ink, success/success-ink, and warning/warning-ink.

## 6. Separate server-safe and client imports

The React root and WebGL entries are client boundaries. In Next.js App Router,
place providers, hooks, and interactive components below `"use client"`.

Server components, build tools, tests, and non-React adapters can import pure
theme, geometry, material, quality, and cache helpers from:

```ts
import { createGlassTheme, signedDistance } from "open-glass-ui/core";
```

## 7. Verify the migration

Before treating the migration as complete:

1. type-check against the exact packed or installed facade;
2. verify root, stylesheet, `core`, and any explicit `webgl` imports;
3. test keyboard behavior, focus restoration, forms, overlays, and toasts;
4. test neutral light/dark, custom accents, reduced motion/transparency, forced
   colors, and no-WebGL fallbacks; and
5. inspect desktop/mobile layouts and real background contrast.

Because this is a pre-`1.0` release candidate, review the
[changelog](../CHANGELOG.md) and public type declarations when moving between
release-candidate versions.
