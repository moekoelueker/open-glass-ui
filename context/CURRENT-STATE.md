# Current State

Status date: 2026-09-29  
Product feature baseline: the 0.4.0 release commit  
Branch: `main`

## Release posture

OpenGlass UI is `0.4.0` (the liquid design, D-022), published on npm on
2026-09-29 through trusted publishing with signed provenance. The owner authorized the
0.4.0 release, the README media refresh, and the moelueker.com/liquid-glass
update on 2026-09-29. Publication was first authorized on 2026-07-26:
a public GitHub repository at `moekoelueker/open-glass-ui`, npm publication of
the single unscoped `open-glass-ui` package, and a marketing page at
`moelueker.com/liquid-glass`.

It is still not:

- Attached to a purchased/configured domain.
- Legally cleared as a trademark.
- Verified on physical devices or with VoiceOver/NVDA.

## Product completion

### Complete

- OpenGlass UI brand and package namespace applied locally.
- One published package with zero runtime dependencies, plus `core`,
  `styles.css`, and `webgl` subpaths. The `@open-glass-ui/*` packages are
  private and inlined at build time.
- CSS-first hybrid architecture.
- Three semantic materials: clear, regular, frosted.
- Neutral adaptive themes.
- Six optional accent presets.
- Custom accent, secondary, and tertiary colors.
- High-contrast foreground logic.
- Forty accessible native-DOM React recipes.
- Product landing page.
- Canonical product component catalog.
- Preserved renderer research and weighted ranking.
- AI-agent documentation and machine-readable references.
- Packaging, license, release checklist, contribution, security, and support
  preparation.

### Landing polish complete

- Header content remains on one line.
- Header becomes an evenly rounded sticky glass capsule.
- Wordmark uses an irregular optical aperture.
- Primary CTAs have a continuous radius-matched rim.
- CTA hover uses a contained caustic sweep and dimensional arrow lens.
- CTA preference modes explicitly handle reduced motion, reduced transparency,
  and forced colors.
- Hero clear lens uses a broad volumetric reflection rather than a diagonal
  streak.
- Hero lenses are interactive on hover/focus/click.
- Contours and distortion visibly change the Creative Studio material field.
- Material anatomy explains source, transformation, and appropriate use.
- Copy actions report failure honestly.
- Lazy routes have accessible pending and recoverable failure states.

## Current route map

```text
/                         product landing
/components               canonical 40-component catalog
/compare                  classic vs liquid design, live split view
/research                 five-engine research home
/library                  weighted ranking
/library/{hybrid,css,webgl}
/experiments/{css,organic,sdf,webgl,hybrid}
/docs
/validation
/llms.txt
/llms-full.txt
```

## Validation summary

Current documentation records:

- 97 files passing Biome.
- TypeScript passing across all packages, showcase, and Next fixture.
- 93 tests across 16 unit/property/SSR/lifecycle/recipe files.
- 155 validated browser checks across Chromium, Firefox, and WebKit.
- Seven intentional capability/scope skips.
- 33/33 focused product-landing checks.
- Thirty-three current release-candidate screenshots.
- React 18 packed-consumer compatibility.
- Next.js 16 RSC/static build compatibility.
- Zero eager WebGL inputs from the root facade.
- 18,743-byte root facade in the recorded isolation probe.
- 1,222-byte tree-shaken `signedDistance` probe.
- No leaked media/GPU resources in the reference teardown.

The latest landing handoff also completed:

- WebKit landing matrix: 11/11.
- Firefox/WebKit stabilized atlas interaction repetition: 10/10.

Canonical evidence: [`../docs/VALIDATION.md`](../docs/VALIDATION.md).

## Visual evidence

Current evidence:

```text
artifacts/screenshots/open-glass-ui-final/
```

It contains landing, ranking, neutral theme, custom accent, and selected
component evidence across Chromium, Firefox, and WebKit at desktop and mobile
sizes.

Historical pass/atlas directories should be preserved as research records.

## Development commands

```bash
pnpm install
pnpm dev
pnpm run check
pnpm run typecheck
pnpm run test:unit
pnpm run build
pnpm run verify:packages
pnpm run test:e2e
pnpm run bench:optics
pnpm run bench:browser
pnpm run release:check
```

Local showcase:

```text
http://127.0.0.1:4173/
```

The browser suite is serialized with bounded retries to avoid false failures
from local GPU/compositor oversubscription.

## Known limitations

- Namespace and legal posture must be refreshed before launch.
- Pre-1.0 APIs may still change during release-candidate review.
- CSS implies rather than performs true arbitrary-DOM refraction.
- SVG behavior remains browser-sensitive.
- WebGL requires owned media and cannot sample arbitrary live page pixels.
- Reduced-transparency detection is not uniform across browsers.
- Reference performance is host-specific and not a mobile-GPU claim.
- The demo video is currently H.264 only.
- Automated accessibility does not replace physical VoiceOver/NVDA review.
- Physical-device GPU, zoom, orientation, touch, and assistive-technology review
  remains.

## Working-tree expectations

At the start of a new task:

1. Run `git status --short`.
2. Treat unexpected changes as owner/user work.
3. Do not restore or overwrite unrelated changes.
4. Read the relevant context file before editing.
5. Keep commits focused and use the repository commit convention.

## Immediate decision boundary

Local improvements, documentation, tests, and release preparation are within
the project’s established scope.

The following require explicit authorization:

- Remote creation/push.
- Namespace reservation.
- npm publication.
- Deployment.
- Domain registration/configuration.
- Credentialed external changes.
- Claims of legal clearance.
