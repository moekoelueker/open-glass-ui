# AI-Agent Usage Guide

This guide helps coding agents adopt OpenGlass UI without inventing APIs,
loading unnecessary renderers, or weakening accessibility.

This document is for agents consuming the library. Agents maintaining the
OpenGlass UI repository itself should start with
[`../HANDOVER.md`](../HANDOVER.md) and
[`../context/README.md`](../context/README.md).

## Canonical package rules

1. Import public React components, hooks, theme utilities, and types from
   `open-glass-ui`.
2. Import recipe CSS once from `open-glass-ui/styles.css`.
3. Import framework-independent utilities in server components, build tools, or
   non-React code from `open-glass-ui/core`.
4. Import GPU functionality only from `open-glass-ui/webgl`.
5. Do not generate consumer imports from internal `@open-glass-ui/*` workspace
   packages.
6. The facade is published on npm as `open-glass-ui`; still verify the
   installed version before relying on version-specific behavior.

```tsx
import "open-glass-ui/styles.css";
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";
```

```ts
import { contrastRatio, createGlassTheme } from "open-glass-ui/core";
```

## Default generation pattern

Unless the user explicitly needs refraction over owned media, generate the
CSS-first path:

```tsx
export function OpenGlassExample() {
  return (
    <GlassSystemProvider
      renderer="auto"
      quality="auto"
      motion="system"
      theme={{ appearance: "system", defaultAppearance: "dark" }}
    >
      <Glass material="regular">
        <Button variant="primary">Continue</Button>
      </Glass>
    </GlassSystemProvider>
  );
}
```

Do not set `renderer="webgl2"` on arbitrary DOM. Do not assume that `auto`
selects WebGL or SVG; `auto` is deliberately CSS-first.

## Renderer decision algorithm

```text
Does the request need normal UI over arbitrary DOM?
  yes -> use CSS-first Glass and native-DOM recipes
  no  -> continue

Does it need deterministic refraction on owned/supplied DOM with stable size?
  yes -> use useSdfFilter + SdfFilterDefinition + renderer="sdf-svg"
  no  -> continue

Does it need refraction of an owned image/canvas/video?
  yes -> import WebGLGlassSurface from open-glass-ui/webgl
  no  -> use CSS
```

Accessibility fallback overrides every branch. Keep original media and semantic
DOM available when an enhanced renderer is unavailable.

## Component selection

Prefer the closest existing recipe among the forty exports. Do not reimplement
buttons, switches, tabs, menus, dialogs, fields, or file inputs as generic
clickable `div` elements. The full list is in [Components](./COMPONENTS.md).

When generating code:

- give `IconButton` an `aria-label`;
- give `SegmentedControl` an `aria-label`;
- give `Toolbar`, `Dock`, `Tabs`, `Menu`, `Popover`, and fields their required
  label props;
- preserve native `disabled`, `required`, `name`, `value`, and form props;
- use controlled and uncontrolled props consistently;
- use `useToast` below `GlassSystemProvider` instead of inventing a global
  notification store;
- hide decorative glyphs with `aria-hidden="true"`; and
- never use material appearance as the only selected/error/loading signal.

## Theming rules

- Start with neutral, high-contrast, adaptive themes.
- Customize through `GlassThemeProvider` and semantic `--ogui-*` tokens.
- Preserve the `ogui` prefix for library CSS variables, classes, data
  attributes, and generated IDs.
- Do not output generic global selectors for `button`, `input`, or `[role]` that
  accidentally override recipe behavior.
- Validate custom accent foreground, focus ring, danger, success, and warning
  foreground/background pairs. The status pairs are
  `--ogui-color-danger`/`--ogui-color-danger-ink`,
  `--ogui-color-success`/`--ogui-color-success-ink`, and
  `--ogui-color-warning`/`--ogui-color-warning-ink`.

## SSR and Next.js rules

- Put providers and hook-using OpenGlass UI components behind a `"use client"`
  boundary in Next.js App Router.
- Use `open-glass-ui/core` for pure utilities needed by a server component;
  do not import the React root merely to reach theme or geometry math.
- Keep server markup deterministic.
- Do not read `window`, `document`, `matchMedia`, canvas, or WebGL during render.
- Do not branch initial markup on client capability.
- Do not silence hydration warnings; correct the mismatch.
- Lazy or subpath-load WebGL so ordinary routes do not pay for it.

## Performance rules

- Use glass selectively for controls/navigation, not every content card.
- Keep DOM text and controls out of canvases.
- Use no more than six lenses per WebGL source and generally one high-value GPU
  stage per view.
- Cap WebGL DPR at 2 unless measured evidence supports more.
- Use refs, transforms, and CSS variables for pointer-rate movement.
- Do not regenerate SDF maps for position-only changes.
- Clean up all media, frame callbacks, observers, and external listeners added
  by application code.

## Prompt template

Agents can use this constraint block when generating an integration:

```text
Use the public open-glass-ui facade and import open-glass-ui/styles.css once.
Default to CSS-first renderer="auto". Keep all controls as semantic DOM.
Use the existing forty recipes before creating custom controls. Require
accessible labels, preserve keyboard behavior, reduced motion/transparency, and
forced-colors fallbacks. Use open-glass-ui/webgl only for an owned
image/canvas/video source. Use open-glass-ui/core for server-safe pure
utilities. Keep Next.js server output deterministic.
```

## Verification

Before presenting generated code as complete:

1. type-check it against the actual installed package;
2. run the relevant unit and browser tests;
3. test keyboard, focus, reduced motion, forced colors, and no-WebGL fallback;
4. check mobile overflow and real background contrast; and
5. state clearly if the package is being consumed from this local pre-release
   workspace rather than npm.

Use [llms.txt](../llms.txt) for routing and [llms-full.txt](../llms-full.txt) for
a self-contained agent reference.
