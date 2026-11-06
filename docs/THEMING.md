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
computed contrast ratio. The derived ink reaches 4.5:1 against the accent fills
the liquid design renders (see `--ogui-color-accent-highlight-mix` below); the
classic design only receives the corrected ink. Always validate the result in its real UI context; automatic derivation is not a
substitute for contrast testing.

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
element, e.g. `.hero-panel { --ogui-glass-light-angle: 20deg; }`, as long as
that element does not write them itself: a provider with `theme.glass` and a
`Glass` with `look` set them inline, which a class cannot beat. The rim is
drawn as one ring exactly on the outer edge, which is why liquid `Glass`
collapses its painted border; pass `style={{ borderWidth }}` to keep one, or
`data-ogui-rim="off"` to remove the ring from a single element.

CSS draws the lit edge, the bloom, and the frost; it cannot bend the pixels
behind the glass. For real refraction on suitable surfaces, combine a look with
`renderer="sdf-svg"` (see RENDERERS.md).

### Liquid control tokens

In the liquid design, raised controls and recessed fields do not read
`--ogui-color-control*` or `--ogui-color-border`. They read these public tokens
instead.

Raised controls are secondary buttons (the default `Button` variant),
`ToggleButton`, the built-in `Dialog` and `Drawer` trigger and the toast restore
button. Quiet buttons, `IconButton` included, take the fill only on hover;
primary buttons are filled with the accent and danger buttons with a tint of the
danger colour.

| Token                   | Effect                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| `--ogui-lg-fill`        | Fill at rest.                                                      |
| `--ogui-lg-fill-hover`  | Fill on hover.                                                     |
| `--ogui-lg-fill-active` | Fill while pressed.                                                |
| `--ogui-radius-capsule` | Corner radius. Segmented controls, tabs and pagination use it too. |

Recessed fields are `TextField`, `Textarea`, `Select`, `NumberField` and
`SearchField`. They are wells cut into the glass, not raised fills.

| Token                   | Effect                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--ogui-lg-well`        | Fill at rest. Checkboxes, radios, the switch, slider, progress and meter tracks, the segmented and tab tracks and `FileDropzone` use it too. |
| `--ogui-lg-well-shadow` | Inset shading of the well.                                                                                     |
| `--ogui-lg-fill`        | Fill while the field has focus.                                                                                |
| `--ogui-radius-control` | Corner radius of `TextField`, `Textarea`, `Select` and `NumberField`, as in classic. `SearchField` is a capsule and uses `--ogui-radius-capsule`. |

Both kinds share these:

| Token                   | Effect                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `--ogui-lg-hairline`    | The thin lines liquid keeps: dividers between accordion sections, above a card footer and between a `NumberField` input and its steppers, `Stepper` connectors and the switch track's edge. Controls and fields draw no border at rest. |
| `--ogui-radius-surface` | Corner radius of cards, overlays and panels (shared with classic).                                                                 |

So in liquid, setting `--ogui-radius-control` does not change a button (use
`--ogui-radius-capsule`), though it still rounds text fields, selects and number
fields. Setting `--ogui-color-control` or `--ogui-color-border` recolours
neither controls nor fields: use `--ogui-lg-fill*` for raised controls,
`--ogui-lg-well` and `--ogui-lg-well-shadow` for fields, and
`--ogui-lg-hairline` for the dividers. The `--ogui-glass-*` multipliers above
scale the raised fills, so reach for them first and for the fill tokens when you
need an exact value. The classic design still reads `--ogui-color-control*`,
`--ogui-color-border` and `--ogui-radius-control` everywhere.
`--ogui-color-text`, `--ogui-color-muted`, `--ogui-color-accent`,
`--ogui-color-accent-ink`, `--ogui-color-focus`, `--ogui-color-danger` and
`--ogui-color-success` apply in both designs.

These `--ogui-lg-*` tokens are declared by the stylesheet, not written inline:
liquid re-resolves them at zero specificity on every liquid scope root and on
every `Glass` element, so each of those elements overrides the value it
inherits, and any class rule on the same element overrides it in turn. Set the
tokens on the element closest to the controls: on the provider (through its
`className` or `style`) for controls that are not inside a `Glass`, and on the
`Glass` itself (through its `className`) for controls inside it. A rule on a
plain wrapper element does not reach controls inside a `Glass`. A selector that
names both covers a whole region:

```css
.hero,
.hero [data-ogui-glass] {
  --ogui-lg-fill: rgb(255 255 255 / 0.18);
  --ogui-lg-fill-hover: rgb(255 255 255 / 0.26);
}
```

The remaining `--ogui-lg-*` variables (ring, bloom, lift, blur, thumb, easing
and others) are implementation details and may change.

## Semantic tokens

The provider writes these public tokens on its `.ogui-theme` wrapper:

| Group            | Tokens                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Canvas           | `--ogui-color-background`, `--ogui-color-canvas`                                                                       |
| Surfaces         | `--ogui-color-surface`, `--ogui-color-surface-strong`                                                                  |
| Content          | `--ogui-color-text`, `--ogui-color-muted`                                                                              |
| Borders          | `--ogui-color-border`, `--ogui-color-border-strong`                                                                    |
| Controls         | `--ogui-color-control`, `--ogui-color-control-hover`, `--ogui-color-control-active`                                    |
| Accent           | `--ogui-color-accent`, `--ogui-color-accent-ink`, `--ogui-color-accent-soft`, `--ogui-color-accent-highlight-mix`      |
| Supporting color | `--ogui-color-secondary`, `--ogui-color-tertiary`                                                                      |
| Status and focus | `--ogui-color-focus`, `--ogui-color-danger`, `--ogui-color-danger-ink`, `--ogui-color-success`, `--ogui-color-success-ink`, `--ogui-color-warning`, `--ogui-color-warning-ink` |
| Shape            | `--ogui-radius-control`, `--ogui-radius-surface`, `--ogui-radius-capsule`                                              |

`--ogui-color-accent-highlight-mix` is a percentage (default `16%`): how much
white the liquid primary button mixes into its top highlight. The theme lowers
it automatically when needed so the accent ink keeps 4.5:1 contrast. The accent
ink is chosen so text on liquid accent fills keeps at least 4.5:1 against the
rendered fill (the base accent, the highlight and the translucency). That
guarantee applies to the default liquid design; classic keeps its 0.3 rendering
and only receives the corrected ink.

Not every token is read by a recipe. `--ogui-color-background`,
`--ogui-color-surface`, `--ogui-color-surface-strong`,
`--ogui-color-border-strong`, `--ogui-color-secondary`, `--ogui-color-tertiary`
and `--ogui-color-accent-soft` are for your own CSS and no recipe consumes them.
`--ogui-radius-capsule` sets the corners of capsule controls (999px, or 0.5rem
with `radius: "sharp"`). In the liquid design, controls and fields take their
fills and hairlines from the tokens in "Liquid control tokens" rather than from
`--ogui-color-control*` and `--ogui-color-border`, and buttons take their
corners from `--ogui-radius-capsule`; text fields, selects and number fields
keep `--ogui-radius-control`.

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

## Where to override tokens

The provider writes the semantic tokens above inline on its `.ogui-theme`
element, together with the `--ogui-glass-*` look tokens when `theme.glass` is
set. An inline declaration on that element beats any stylesheet rule on an
ancestor, so overrides on `:root`, `html` or `body` have no effect:

```css
/* Does nothing: the provider's inline value is closer to the components. */
:root {
  --ogui-color-accent: #22705c;
}
```

Use one of these instead.

1. The typed theme input, for whole-theme changes:

   ```tsx
   <GlassSystemProvider theme={{ theme: { preset: "teal", accent: "#22705c" } }}>
   ```

2. The provider's `style`, whose values replace the generated tokens of the
   same name. Pass only the tokens you want to change; the rest keep their
   generated values:

   ```tsx
   import type { CSSProperties } from "react";

   <GlassSystemProvider
     theme={{ style: { "--ogui-color-accent": "#22705c" } as CSSProperties }}
   >
   ```

   The `as CSSProperties` cast is needed because TypeScript's style type does
   not list custom properties.

   A class on the provider does not work for these tokens: it is a stylesheet
   rule on the same element, and the inline token wins. The liquid
   `--ogui-lg-*` tokens are a different case. The provider does not write them;
   the stylesheet declares them at zero specificity, so a provider class does
   override them (see "Liquid control tokens").

3. A descendant class, which scopes the override to one region:

   ```css
   .billing-zone {
     --ogui-color-accent: #22705c;
     --ogui-color-accent-ink: #ffffff;
     --ogui-color-focus: #22705c;
     /* Light ink on a mid-tone accent: lower the highlight, for example 0%
        to 8%, so the label keeps its contrast. */
     --ogui-color-accent-highlight-mix: 8%;
   }
   ```

When you override `--ogui-color-accent` locally, also set
`--ogui-color-accent-ink` and the focus colour. For a light ink on a mid-tone
accent, also lower `--ogui-color-accent-highlight-mix`. Then verify the contrast
of the result.

## Typography

Recipes use `font: inherit` and the library ships no font family. A page without
a font renders in the browser default serif. Set a font on the application, for
example `body { font-family: system-ui, sans-serif; }`. The theme wrapper does
not set one.

## Using with Tailwind CSS v4 (cascade layers)

The library stylesheet is unlayered, and unlayered CSS beats layered CSS
regardless of specificity. Tailwind v4 puts its utilities in `@layer utilities`,
so a utility such as `rounded-lg` or `bg-red-500` on an OpenGlass component loses
to the recipe styles. Import the stylesheet into its own layer, ordered between
Tailwind's `base` and `components`, at the top of your main CSS file:

```css
@layer theme, base, ogui, components, utilities;
@import "open-glass-ui/styles.css" layer(ogui);
@import "tailwindcss";
```

Do not also import `open-glass-ui/styles.css` from JavaScript, or the unlayered
copy comes back. With this order, utilities override recipe styles, recipe styles
override Tailwind's preflight, and your own unlayered CSS overrides both. The
same layering works with any other layered CSS setup. Custom properties are not
layer-sensitive, so the token scoping rules above apply unchanged.

`Glass` (and the recipes drawn through it: Toolbar, Dock, Menu and Popover
surfaces) writes its material inline, so utilities still restyle its shape and
spacing but not its background, border color, shadow or backdrop filter. Change
the material with the `look` prop, the `--ogui-glass-*` tokens, or the `style`
prop.

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

## Glass over imagery: forcing a tone

A surface can force its own tone, whatever the app appearance is:
`<Glass tone="dark">` or `<Glass tone="light">`. This is the way to place glass
over a photo or video. In releases after 0.4.0 the surface's text, muted text,
borders and control tokens switch to that tone as well, and nested recipes and
nested `Glass` follow it. In 0.4.0 only the material changes and the text inside
inherits the app theme. Keep a legible backdrop and check contrast over the real
image. `Toolbar`, `Dock`, `Menu` and `Popover` accept the same `tone` prop.

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
