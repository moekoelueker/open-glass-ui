# Architecture Map

Canonical detail: [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)

## System overview

```text
Consumer application
        │
        ├── import "open-glass-ui/styles.css"
        ├── import { … } from "open-glass-ui"
        ├── optional pure imports from "open-glass-ui/core"
        └── optional GPU imports from "open-glass-ui/webgl"
                    │
                    ▼
           packages/ui public facade
                    │
          ┌─────────┼──────────┐
          ▼         ▼          ▼
       recipes    react    core/webgl subpaths
          │         │
          ▼         ▼
        react ──► renderers ──► core
                     │
                     ▼
                CSS / SVG / WebGL
```

## Package ownership

| Path | Runtime role | Key constraints |
| --- | --- | --- |
| `packages/core` | Geometry, SDF, normals, maps, materials, quality, cache, theme math | Zero runtime dependencies; no React, DOM, or browser globals |
| `packages/renderers` | Capability policy, CSS tokens, SVG map encoding, WebGL2 renderer | No component behavior |
| `packages/react` | Providers, glass primitives, filters, source groups, pointer/media lifecycle | No recipe styling; no browser access during render |
| `packages/recipes` | Forty accessible React recipes and shared CSS | No renderer policy or optical math |
| `packages/ui` | Single consumer-facing facade and subpath re-exports | Preserve public import stability and WebGL isolation |
| `apps/showcase` | Product landing, research routes, catalogs, live evidence | Private app; may use workspace source aliases |
| `examples/next` | Next.js App Router/RSC/static compatibility fixture | Must remain deterministic and use public facade |

## Public facade

Normal client code:

```tsx
import "open-glass-ui/styles.css";
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";
```

Server-safe pure utilities:

```ts
import {
  contrastRatio,
  createGlassTheme,
  signedDistance,
} from "open-glass-ui/core";
```

Explicit GPU path:

```tsx
import { WebGLGlassSurface } from "open-glass-ui/webgl";
```

Do not generate consumer imports from internal workspace package names.

## Runtime policy flow

```text
Server render
  │
  ├── Stable semantic DOM
  ├── CSS material baseline
  └── No browser capability guess
          │
          ▼
Post-hydration capability detection
  │
  ├── forced colors / reduced transparency ──► opaque semantic CSS
  ├── renderer="auto" or "css" ──────────────► layered CSS
  ├── explicit organic-svg / sdf-svg ────────► requested SVG if supported
  └── explicit webgl2 + owned media ─────────► WebGL2 surface if supported
                                                   │
                                                   └── original media + DOM
                                                       controls on fallback
```

Capabilities are tracked independently rather than inferred from user-agent
strings.

## Optical model

### Deterministic geometry path

1. Evaluate a signed-distance function for circle, capsule, rounded rectangle,
   or superellipse.
2. Use finite differences to calculate unit normals.
3. Convert distance into thickness and edge response.
4. Encode displacement/specular/mask values into a bounded RGBA map.
5. Cache maps with stable keys in an 8 MiB LRU.
6. Use the map through a conservative SVG filter definition.

### WebGL path

1. Accept an owned image, canvas, or video source.
2. Pack up to six lens definitions.
3. Evaluate lens geometry, normals, thickness, IOR, dispersion, frost, edge
   response, and restrained highlights in the shader.
4. Bound device pixel ratio and drawing.
5. Use `requestVideoFrameCallback` when available.
6. Stop hidden-document work and dispose contexts, callbacks, observers, and
   resources on teardown.

The two paths share optical vocabulary, not necessarily identical pixels.

## React composition

`GlassSystemProvider` combines:

- Runtime renderer/quality/motion policy.
- Theme and appearance boundary.
- Global toast behavior.

Lower-level providers remain available for advanced composition.

`Glass` is the semantic material primitive. It accepts semantic material and
renderer inputs while preserving its DOM content.

`GlassGroup` and `GlassSource` coordinate supplied source/content relationships.

`useSdfFilter`, `SdfFilterDefinition`, and `OrganicFilterDefinition` support
explicit filter paths.

`WebGLGlassSurface` remains outside the root facade’s eager module graph.

## Theme flow

```text
Theme input
  ├── appearance: light | dark | system
  ├── preset: neutral | cobalt | teal | violet | coral | amber
  ├── custom accent / secondary / tertiary
  ├── contrast: standard | high
  └── radius: sharp | balanced | soft
          │
          ▼
Framework-independent theme calculation
          │
          ▼
--ogui-color-* / --ogui-radius-* / --ogui-material-* tokens
          │
          ▼
Glass primitive + forty recipes + showcase
```

The server uses a deterministic default appearance and updates system
preference after hydration.

## Component system

The forty recipes span:

- Controls: Button, IconButton, SegmentedControl, Switch, Slider,
  ToggleButton.
- Command/media: Toolbar, Dock, Menu, MenuItem, Popover, Tooltip,
  MediaControls.
- Navigation: Tabs, Breadcrumbs, Pagination, Stepper.
- Data/status: Badge, Avatar, AvatarGroup, Card, Stat, Progress, Meter,
  Spinner, Skeleton.
- Feedback/overlays: Alert, Banner, Accordion, Dialog, Drawer, Toast.
- Forms: Checkbox, RadioGroup, Select, TextField, Textarea, SearchField,
  NumberField, FileDropzone.

The list is defined for public recipes across
`packages/recipes/src/index.tsx` and `packages/recipes/src/atlas.tsx`.

Common behavior:

- Native semantic elements.
- Native form props where applicable.
- Accessible names and generated relationships.
- Predictable controlled/uncontrolled props.
- Keyboard paths and focus restoration.
- Shared tokens and CSS.

## Showcase route architecture

`apps/showcase/src/app.tsx` owns the client-side route switch.

- `/` eagerly loads the product landing.
- Heavier comparison/catalog pages are route-lazy.
- `Suspense` provides an accessible loading state.
- A route error boundary provides reload and stable-home recovery.
- `AppLink` in `navigation.tsx` preserves normal anchor behavior while handling
  internal history navigation.

The primary sections of the landing are:

1. Hero and live material playground.
2. Product/system benefits.
3. Material anatomy.
4. Working product scenarios.
5. Forty-component inventory.
6. Setup.
7. AI-agent guidance.
8. Validation.
9. Final CTA.

## Performance rules

- No React state update on every pointer frame.
- Position changes do not regenerate maps.
- Low/medium/high quality profiles are bounded.
- Stable maps are cached.
- WebGL is one high-value surface, not forty canvases.
- CSS-only imports must not include WebGL modules.
- Off-screen catalog content uses browser containment/visibility strategies.
- Decorative animations stop or simplify with reduced motion.

## Accessibility rules

- Optical layers never replace semantic content.
- Visible focus is mandatory.
- Color/transparency is not the only state carrier.
- Reduced motion freezes decorative motion and media.
- Reduced transparency removes translucent dependence.
- Forced colors uses system colors and opaque surfaces.
- Opaque/no-enhancement fallbacks remain usable.
- Automated tests target WCAG 2.2 AA behavior but do not claim certification.

## Build and validation flow

```text
Biome
  ▼
Package builds + declarations + Next type generation
  ▼
Unit/property/SSR/lifecycle/recipe tests
  ▼
Vite + Next production builds
  ▼
Package tarballs + clean consumer + React 18 + tree shaking
  ▼
Serialized Chromium / Firefox / WebKit behavior and screenshot checks
  ▼
Optics and browser performance gates
```

Use `pnpm run release:check` for the complete local gate.
