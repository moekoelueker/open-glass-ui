# Theming OpenGlass UI

OpenGlass UI ships neutral, adaptive light and dark themes. The theme API
produces semantic `--ogui-*` CSS custom properties; component recipes consume
those tokens rather than hard-coded brand colors.

> **Release status:** `open-glass-ui@0.4.0` is published on npm. APIs may still
> change before `1.0.0`.

## Start with the providers

Import the recipe stylesheet once near the application root, then wrap the
interface with the runtime and theme providers:

```tsx
import "open-glass-ui/styles.css";
import { Button, GlassProvider, GlassThemeProvider } from "open-glass-ui";

export function App() {
  return (
    <GlassProvider renderer="auto" quality="auto" motion="system">
      <GlassThemeProvider
        appearance="system"
        defaultAppearance="dark"
        theme={{ preset: "neutral", contrast: "high", radius: "balanced" }}
      >
        <main>
          <Button variant="primary">Continue</Button>
        </main>
      </GlassThemeProvider>
    </GlassProvider>
  );
}
```

`GlassProvider` controls rendering, quality, and motion policy.
`GlassThemeProvider` controls color appearance and semantic design tokens.
The facade also provides `GlassSystemProvider` when one combined boundary is
more convenient:

```tsx
import { GlassSystemProvider } from "open-glass-ui";

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
</GlassSystemProvider>;
```

## Theme options

`GlassThemeProvider` accepts:

| Prop                | Values                                                  | Default      | Purpose                                     |
| ------------------- | ------------------------------------------------------- | ------------ | ------------------------------------------- |
| `appearance`        | `"light"`, `"dark"`, `"system"`                         | `"system"`   | Select an explicit or system color scheme.  |
| `defaultAppearance` | `"light"`, `"dark"`                                     | `"dark"`     | Stable server and pre-hydration appearance. |
| `theme.preset`      | `neutral`, `cobalt`, `teal`, `violet`, `coral`, `amber` | `neutral`    | Choose a restrained accent family.          |
| `theme.accent`      | 3- or 6-digit hex                                       | preset value | Override the primary accent.                |
| `theme.secondary`   | 3- or 6-digit hex                                       | preset value | Override the secondary accent.              |
| `theme.tertiary`    | 3- or 6-digit hex                                       | preset value | Override the tertiary accent.               |
| `theme.contrast`    | `"standard"`, `"high"`                                  | `"high"`     | Adjust neutral text and border contrast.    |
| `theme.radius`      | `"sharp"`, `"balanced"`, `"soft"`                       | `"soft"` (liquid), `"balanced"` (classic) | Select semantic control and surface radii.  |
| `design`            | `"liquid"`, `"classic"`                                 | `"liquid"`   | Visual language (see below).                |

Custom theme colors intentionally accept hex values only. Invalid values throw
an error early instead of silently producing an unreadable palette.

```tsx
<GlassThemeProvider
  appearance="light"
  theme={{
    preset: "neutral",
    accent: "#185fd1",
    secondary: "#47678f",
    tertiary: "#8a5c20",
    contrast: "high",
    radius: "sharp",
  }}
>
  {children}
</GlassThemeProvider>
```

`createGlassTheme()` derives a readable accent foreground and exposes the
computed contrast ratio. Always validate the result in its real UI context;
automatic derivation is not a substitute for contrast testing.

## Design: liquid and classic

`design="liquid"` (the default since 0.4) renders clear, highly saturated glass
lit by a directional specular rim, pill-shaped controls, a glass thumb that
springs between segments and tabs, lens-style switch and slider thumbs, and
recessed input wells. `design="classic"` renders the 0.3 look exactly.

```tsx
<GlassSystemProvider design="classic">{children}</GlassSystemProvider>
```

Scopes nest, and the nearest one wins, so one section can be migrated at a
time. The provider writes `data-ogui-design` on its wrapper, every `Glass`
element carries it too, and portaled overlays, menus, and toasts inherit it.

## Glass look: art-direct the liquid material

Every liquid surface and control reads a small set of public multipliers, so
you can move the whole site, one section, or one element between frosted,
see-through, smoked, and light-bending glass without touching components.

| Field         | CSS variable                | Default  | Effect                                                         |
| ------------- | --------------------------- | -------- | -------------------------------------------------------------- |
| `blur`        | `--ogui-glass-blur`         | `1`      | Backdrop blur multiplier. `0` is perfectly clear.              |
| `opacity`     | `--ogui-glass-opacity`      | `1`      | Tint density. Low is see-through, high is solid.               |
| `tint`        | `--ogui-glass-tint` (`-dark`, `-light`) | per tone | Colour mixed into surfaces. Pass `{ dark, light }` to tint each appearance differently. |
| `saturation`  | `--ogui-glass-saturation`   | `1`      | How vividly colour bleeds through.                             |
| `brightness`  | `--ogui-glass-brightness`   | `1`      | Below `1` dims what sits behind the glass.                     |
| `rim`         | `--ogui-glass-rim`          | `1`      | The whole edge: hairline, highlight, bloom. `0` removes it.    |
| `highlight`   | `--ogui-glass-highlight`    | `1`      | Directional highlight only. `0` leaves a plain hairline.       |
| `lightAngle`  | `--ogui-glass-light-angle`  | `340deg` | Where the light comes from: `0` top, `90` right, `270` left.   |
| `lightSpread` | `--ogui-glass-light-spread` | `110deg` | How much of the edge the highlight covers (0 to 170 degrees; 0 turns it off). |
| `lensing`     | `--ogui-glass-lensing`      | `1`      | The bright inner edge band that reads as thick, bending glass. |
| `shadow`      | `--ogui-glass-shadow`       | `1`      | Drop-shadow depth.                                             |

Presets: `liquid` (default), `frosted`, `clear`, `smoked`, `lensed`.

**Legibility.** Dark liquid glass dims whatever is behind it and light glass
lifts it, and secondary text on glass is "vibrant" (the muted colour pulled
towards the ink). Every preset keeps body and secondary text at WCAG AA
(4.5:1 or better) over bright, dark, and busy backdrops in both appearances, as
measured on the showcase `/compare` scene. Lowering `opacity`, `brightness`
(in dark mode), or choosing a dark `tint` in light mode can take text below
that; check contrast when you go beyond the presets. A dark tint needs light
text, so give it only to the dark appearance: `tint: { dark: "#0b0d10" }`.

```tsx
// Whole site
<GlassSystemProvider theme={{ theme: { glass: "frosted" } }}>

// One section, fine-tuned
<GlassThemeProvider theme={{ glass: { ...GLASS_LOOK_PRESETS.smoked, lightAngle: 300 } }}>

// One surface: the controls inside it follow too
<Glass look={{ lightAngle: 200, rim: 1.4, blur: 0.4 }}>
```

The same variables can be set from plain CSS on any theme boundary or `Glass`
element, e.g. `.hero-panel { --ogui-glass-light-angle: 20deg; }`. The rim is
drawn as one ring exactly on the outer edge, which is why liquid `Glass`
collapses its painted border; pass `style={{ borderWidth }}` to keep one, or
`data-ogui-rim="off"` to remove the ring from a single element.

CSS draws the lit edge, the bloom, and the frost; it cannot bend the pixels
behind the glass. For real refraction on suitable surfaces, combine a look with
`renderer="sdf-svg"` (see RENDERERS.md).

Liquid adds its own private `--ogui-lg-*` variables on the design scope. They
are implementation details and may change; theme through the `--ogui-color-*`
and `--ogui-radius-*` tokens instead.

## Semantic tokens

The provider writes these public tokens on its `.ogui-theme` wrapper:

| Group            | Tokens                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Canvas           | `--ogui-color-background`, `--ogui-color-canvas`                                                                       |
| Surfaces         | `--ogui-color-surface`, `--ogui-color-surface-strong`                                                                  |
| Content          | `--ogui-color-text`, `--ogui-color-muted`                                                                              |
| Borders          | `--ogui-color-border`, `--ogui-color-border-strong`                                                                    |
| Controls         | `--ogui-color-control`, `--ogui-color-control-hover`, `--ogui-color-control-active`                                    |
| Accent           | `--ogui-color-accent`, `--ogui-color-accent-ink`, `--ogui-color-accent-soft`                                           |
| Supporting color | `--ogui-color-secondary`, `--ogui-color-tertiary`                                                                      |
| Status and focus | `--ogui-color-focus`, `--ogui-color-danger`, `--ogui-color-danger-ink`, `--ogui-color-success`, `--ogui-color-success-ink`, `--ogui-color-warning`, `--ogui-color-warning-ink` |
| Shape            | `--ogui-radius-control`, `--ogui-radius-surface`                                                                       |

Use semantic tokens in application CSS:

```css
.account-panel {
  border: 1px solid var(--ogui-color-border);
  border-radius: var(--ogui-radius-surface);
  color: var(--ogui-color-text);
  background: var(--ogui-color-surface);
}

.account-panel__hint {
  color: var(--ogui-color-muted);
}
```

For a localized override, set tokens on a descendant scope:

```css
.billing-zone {
  --ogui-color-accent: #22705c;
  --ogui-color-accent-ink: #ffffff;
  --ogui-color-focus: #22705c;
}
```

Prefer the typed `theme` input for whole-theme changes. If an application must
override generated tokens directly on the provider, pass them through its
`style` prop after verifying the foreground, focus, and status contrast.

## Material tokens

Each `Glass` surface also resolves material-specific tokens:

```text
--ogui-material-background
--ogui-material-border
--ogui-material-highlight
--ogui-material-shadow
--ogui-material-text
--ogui-material-muted
--ogui-material-filter
--ogui-material-dim
```

These adapt to the selected `clear`, `regular`, or `frosted` material and become
opaque/system-colored when reduced transparency or forced colors requires it.
Treat them as an advanced styling surface; theme tokens should satisfy most
application customization.

## Utilities

The public facade exposes framework-independent theme helpers. In a server
component, build tool, test, or non-React adapter, import them from the
server-safe `open-glass-ui/core` subpath so the React client boundary is not
loaded:

```ts
import {
  contrastRatio,
  createGlassTheme,
  createGlassThemeTokens,
  readableForeground,
  relativeLuminance,
} from "open-glass-ui/core";

const palette = createGlassTheme("dark", {
  preset: "cobalt",
  contrast: "high",
});
const tokens = createGlassThemeTokens(palette);
```

The same helpers are re-exported from the React facade for client code. Runtime
class names, CSS variables, DOM data attributes, and library-owned generated
resources use the `ogui` prefix to avoid ambiguous generic names.

## SSR and Next.js

Theme creation from `open-glass-ui/core` is server-safe. The React root and
`webgl` entries are client boundaries. With `appearance="system"`, the server
renders `defaultAppearance`; the provider reads `prefers-color-scheme` after
hydration. Choose a deterministic default that matches the surrounding
document and avoid rendering different semantic content for light and dark
modes.

In a Next.js App Router project, keep the interactive provider boundary in a
client component:

```tsx
"use client";

import "open-glass-ui/styles.css";
import { GlassProvider, GlassThemeProvider } from "open-glass-ui";

export function OpenGlassRoot({ children }: { children: React.ReactNode }) {
  return (
    <GlassProvider>
      <GlassThemeProvider appearance="system" defaultAppearance="dark">
        {children}
      </GlassThemeProvider>
    </GlassProvider>
  );
}
```

Do not read `window`, `matchMedia`, canvas, or GPU state during server render.
OpenGlass UI performs capability and preference detection after hydration.
