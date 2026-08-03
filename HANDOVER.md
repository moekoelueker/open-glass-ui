# OpenGlass UI Handover

Status date: 2026-08-03  
Product implementation baseline: the 0.3.0 release commit  
Release posture: `0.3.0`, publishing to npm as a single package

## Why this document exists

This is the primary handover for OpenGlass UI. It gives a future maintainer or
AI agent enough product, design, research, architectural, and operational
context to continue without reconstructing the project from its full history.

Read this file first, then use [context/README.md](./context/README.md) to choose
only the deeper context needed for the task.

## Executive summary

OpenGlass UI is an independent, MIT-licensed React design system for premium
glass-like web interfaces. It is intended to become the best free, open-source
starting point for people searching for “Liquid Glass UI” on the web without
claiming affiliation with or pixel parity to Apple.

The project is deliberately more than a visual effect:

- Forty accessible, native-DOM React components form the reusable system.
- Neutral adaptive light and dark themes are the default.
- Accent, secondary, and tertiary colors are configurable.
- CSS is the universal, CSS-first material and the result of
  `renderer="auto"`.
- SVG/SDF refraction is an explicit enhancement for suitable DOM surfaces.
- WebGL2 is an explicit opt-in for owned image, canvas, or video sources.
- Reduced motion, reduced transparency, forced colors, SSR, hydration,
  lifecycle cleanup, and fallback behavior are part of the design contract.
- A product landing page demonstrates the system, while separate research
  routes preserve the five-engine comparison that led to the architecture.

The guiding product thesis is:

> Make the interface feel dimensional. Keep the product usable.

## Original objective

The project began with a request to research existing Liquid Glass work on the
web and GitHub, study Apple’s material principles and relevant web
implementations, and then build a substantially more complete React/web-native
library from first principles.

The desired result needed to:

1. Look premium, sharp, modern, high-contrast, and unusually polished.
2. Avoid being a single screenshot effect or a generic glassmorphism demo.
3. Provide reusable abstractions and enough customization for real products.
4. Compare genuinely different optical approaches rather than cosmetic
   variations.
5. Demonstrate realistic product compositions and forty working components.
6. Remain approachable to both human developers and AI coding agents.
7. Be architecturally ready for GitHub and npm without publishing yet.
8. Include rigorous browser, accessibility, packaging, performance, and visual
   verification.
9. Support a future launch video and a high-quality article on moluker.com.

The historical example at
`/Users/moe/personal/Personal/Liquid-Glass/old-liquid-glass-example` was treated
as read-only inspiration. The current repository was built independently.

## What exists now

### Product surfaces

| Route | Purpose |
| --- | --- |
| `/` | Public OpenGlass UI product landing page |
| `/components` | Canonical forty-component product catalog |
| `/research` | Original five-engine research home |
| `/library` | Weighted engine ranking |
| `/library/hybrid` | Adaptive Hybrid forty-component atlas |
| `/library/css` | Native CSS forty-component atlas |
| `/library/webgl` | Spectral WebGL forty-component atlas |
| `/experiments/*` | Five original renderer experiments |
| `/docs` | In-showcase integration documentation |
| `/validation` | In-showcase evidence ledger |
| `/llms.txt` | Compact AI integration reference |
| `/llms-full.txt` | Self-contained AI integration reference |

### Landing page

The product landing in `apps/showcase/src/landing-page.tsx` and
`landing-page.css` contains:

- A one-line navigation bar that becomes an evenly rounded sticky glass pill.
- A custom irregular optical-aperture wordmark.
- A live hero material playground with source, material, theme, custom color,
  intensity, motion, and interactive lens controls.
- A volumetric hero reflection rather than a flat diagonal highlight.
- Radius-matched premium CTAs with a contained caustic hover sweep.
- Material-anatomy studies for frost, thickness/contours, and spectral edges.
- Four working product scenarios: Creative Studio, Analytics, Material Builder,
  and Feedback/Overlays.
- A forty-component inventory.
- Honest pre-publication setup instructions.
- AI-agent guidance and machine-readable documentation links.
- Validation evidence and a final conversion section.

### Library and packages

Consumers install one public package:

```bash
npm install open-glass-ui react react-dom
```

```tsx
import "open-glass-ui/styles.css";
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";
```

The public entry points are:

- `open-glass-ui`
- `open-glass-ui/styles.css`
- `open-glass-ui/core`
- `open-glass-ui/webgl`

`open-glass-ui` is the **only** published package. The four `@open-glass-ui/*`
workspace packages are `private: true` build-time boundaries: tsup inlines both
their runtime code and their declarations into the published artifact, so the
tarball has zero runtime dependencies and a consumer cannot resolve an internal
path even by accident.

Two build constraints exist because of this and must not be reverted casually:

- Rollup's treeshake pass is disabled in `packages/ui/tsup.config.ts`. It strips
  module-level directives, which removes the `"use client"` boundary from
  `index.js` and `webgl.js` and breaks React Server Components.
- `packages/ui/tsconfig.json` maps the two WebGL subpaths explicitly.
  rollup-plugin-dts does not follow `exports` subpath maps, so without the
  mapping `webgl.d.ts` ships unresolvable `@open-glass-ui/*` imports.

## Research-to-product decisions

The research compared five genuinely different approaches:

1. Layered CSS.
2. Organic SVG displacement.
3. Geometric SDF/SVG displacement.
4. Controlled-media WebGL2 refraction.
5. An adaptive hybrid policy.

The final weighted product ranking gave visual appeal 50% of the score, then
considered flexibility, AI/integration ergonomics, performance, and resilience:

| Rank | Approach | Weighted score | Product role |
| ---: | --- | ---: | --- |
| 1 | Adaptive Hybrid | 9.36 | Overall architecture |
| 2 | Native CSS | 9.25 | Universal/default material |
| 3 | Spectral WebGL | 8.66 | Optional cinematic specialist |
| 4 | Organic SVG | 8.60 | Expressive recipe |
| 5 | Geometric SDF | 8.59 | Explicit deterministic adapter |

This led to the central architecture decision:

> Use one semantic component contract with a CSS-first default, explicit SVG/SDF
> enhancement, and opt-in controlled-media WebGL.

Important consequences:

- “Hybrid” does not mean silently choosing the most expensive renderer.
- `renderer="auto"` always means CSS-first.
- Text and controls remain DOM-native and are never flattened into canvas.
- WebGL cannot generally sample arbitrary page pixels and is not a universal
  DOM solution.
- Physics-inspired parameters are coherent, but the project does not claim to
  be a physically accurate spectral renderer.
- The material is a hierarchy tool, not decoration applied everywhere.

The detailed evidence is summarized in
[context/RESEARCH-SUMMARY.md](./context/RESEARCH-SUMMARY.md) and preserved in
[docs/RESEARCH.md](./docs/RESEARCH.md),
[docs/EXPERIMENT-REPORT.md](./docs/EXPERIMENT-REPORT.md), and
[docs/COMPONENT-ATLAS.md](./docs/COMPONENT-ATLAS.md).

## Brand and legal posture

The owner selected **OpenGlass UI**.

| Surface | Selected form |
| --- | --- |
| Display name | `OpenGlass UI` |
| Intended npm facade | `open-glass-ui` |
| Intended repository slug | `open-glass-ui` |
| Internal namespace | `@open-glass-ui/*` |
| Runtime prefix | `ogui` |

The searchable descriptor remains:

> The open-source Liquid Glass UI system for React and the web.

The name was selected for clarity and discovery, not because it was proven
legally exclusive. Automated availability checks were time-bound preliminary
signals. Recheck namespaces and complete a confusing-similarity review before
public launch.

OpenGlass UI is independent and is not affiliated with, endorsed by, or
sponsored by Apple Inc. Do not use Apple assets, proprietary fonts, branding,
or unqualified pixel-parity claims.

## Current quality state

The release-candidate evidence currently records:

- 97 files passing Biome checks.
- All TypeScript projects and declaration builds passing.
- 105 unit, property, SSR, lifecycle, theme, and recipe checks.
- 161 browser checks validated across Chromium, Firefox, and WebKit, with seven
  intentional capability/scope skips.
- A focused 33/33 product-landing matrix.
- Thirty-three current release-candidate screenshots.
- React 18 packed-consumer and Next.js 16 RSC/static validation.
- Zero eager WebGL inputs from the public root facade.
- A 1,222-byte tree-shaken `signedDistance` probe.
- No observed resource leak after media/WebGL teardown in the reference run.

The authoritative details and caveats are in
[docs/VALIDATION.md](./docs/VALIDATION.md) and
[docs/PERFORMANCE.md](./docs/PERFORMANCE.md).

## What is intentionally not done

The following actions require fresh owner authorization and must not be inferred
from this handover:

- Creating or pushing to a GitHub remote.
- Reserving or publishing npm packages.
- Buying or configuring a domain.
- Deploying the showcase.
- Claiming trademark clearance.
- Presenting the release-candidate install command as currently available.

Remaining launch gates include real-device browser/GPU review, VoiceOver and
NVDA review, 200–400% zoom/touch review, namespace/legal rechecks, final API and
semver review, CI configuration, provenance publishing, and external
post-publication installation tests.

## How to resume safely

1. Read `AGENTS.md`.
2. Read this document.
3. Read [context/README.md](./context/README.md).
4. Read only the context file relevant to the requested work.
5. Run `git status --short` and preserve unrelated changes.
6. Confirm whether the task is local implementation, launch preparation, or an
   explicitly authorized external action.
7. Use public package imports in examples.
8. Run proportionate checks and visually inspect user-facing changes.
9. Update this context pack when an architectural, product, release, or brand
   decision changes.
10. Make one focused commit per task using the repository’s commit convention.

Start locally with:

```bash
pnpm install
pnpm dev
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

The complete publish-blocking gate is:

```bash
pnpm run release:check
```

The browser stage is deliberately serialized with bounded retries because the
visual suite can oversubscribe local GPU/compositor resources when many
WebGL/backdrop pages run simultaneously.

## Context pack

- [Context index](./context/README.md)
- [Product brief](./context/PRODUCT-BRIEF.md)
- [Research summary](./context/RESEARCH-SUMMARY.md)
- [Decision log](./context/DECISIONS.md)
- [Architecture map](./context/ARCHITECTURE-MAP.md)
- [File and ownership map](./context/FILE-MAP.md)
- [Current state](./context/CURRENT-STATE.md)
- [Next steps](./context/NEXT-STEPS.md)
- [Copy-paste handover prompt](./context/HANDOVER-PROMPT.md)

## Canonical-reference rule

This handover explains intent and navigation. Exact API behavior remains
canonical in source, package declarations, tests, and the topic documentation
under `docs/`. If a handover statement conflicts with current tested source,
verify the source and update the handover in the same task.
