# State

- Public name: OpenGlass UI
- Public package slug: `open-glass-ui`
- Workspace namespace: `@open-glass-ui/*`
- Phase: Local release candidate complete
- Completed plans: 00-01, 01-01, 01-02, 02-01, 02-02, 03-01, 03-02, 04-01,
  04-02, 05-01, 05-02, 05-03, 05-04, 06-01, 07-01, 07-02
- Next plan: owner-authorized namespace, remote, physical-device, and
  publication work
- Public name: approved by owner on 2026-07-25
- Remote/publishing: not authorized
- Old example: read-only and outside this repository
- Next implementation: external launch gates only; no publishing is authorized

## Plan 00-01 evidence

- Separate repository initialized on `main`.
- Identity and MIT licensing recorded without approving a public brand.
- Seven-project pnpm workspace installs cleanly.
- Vite showcase and Next.js SSR fixture build.
- Chromium, Firefox, and WebKit scaffold smoke tests pass.
- Core has no runtime dependencies.
- React packages keep React and React DOM as peer dependencies.
- CI, Changesets, contribution, security, support, browser, and limitation
  policies are present.

## Decisions

- MIT license.
- OpenGlass UI is the selected public brand.
- `open-glass-ui` is the intended facade package and repository slug.
- `@open-glass-ui/*` is the workspace implementation namespace.
- `ogui` is the CSS custom-property, class, DOM-data, and generated-ID prefix.
- pnpm workspace with core, renderers, React, recipes, showcase, and Next fixture.
- TypeScript 5.9.3 until the declaration bundler supports TypeScript 7.
- CSS/SVG/WebGL2 progressive architecture.
- HTML-in-Canvas and WebGPU remain research-only.
- No direct prior-art code adaptation at repository initialization.

## Plan 01-01 evidence

- Circle, capsule, rounded-rectangle, and superellipse signed-distance functions.
- Finite, unit-length surface normals with a coherent thickness profile.
- Regular, clear, and frosted optical presets.
- Deterministic RGBA maps encoding displacement, specular response, and mask.
- Stable cache keys.
- Property tests cover sign, symmetry, finite invalid-input handling, unit normals,
  neutral exteriors, bounded bytes, deterministic output, and monotonic thickness.
- Nineteen unit/property tests pass.
- The optics core builds to an 8.92 KB unminified ESM module before gzip.

## Plan 01-02 evidence

- Low, medium, and high profiles have bounded dimensions and explicit dispersion
  sample counts.
- Async generation is browser/worker-global-safe and abortable.
- An 8 MiB bounded least-recently-used cache avoids regenerating stable maps.
- Twenty-nine unit/property tests pass.
- Reference-host p95 generation stays below 4 ms at low and 12 ms at medium
  quality for every initial shape.
- High-quality large maps are explicitly restricted to stable/deferred/worker
  generation.

## Plan 02-01 evidence

- SSR-safe capability detection avoids user-agent sniffing.
- Backdrop blur, backdrop URL syntax, SVG elements, and WebGL2 are represented as
  separate capabilities.
- Adaptive selection is CSS-first; controlled-media WebGL2 is an explicit
  opt-in, while supplied-DOM SDF/SVG remains available without changing the
  semantic component contract.
- Forced colors and reduced transparency always resolve to CSS/opaque material.
- SVG map encoding, stable map-specific IDs, conservative filter bounds, and RGB
  channel scale separation are implemented.
- Clear, regular, frosted, unsupported, reduced-transparency, and forced-colors
  CSS token sets are tested.
- Forty-two unit/property tests pass.

## Plan 02-02 evidence

- A genuine WebGL2 controlled-media renderer samples image, canvas, or video
  textures behind as many as six shared lenses.
- The shader uses rounded-rectangle signed distance, thickness, index of
  refraction, restrained RGB dispersion, frost, edge response, and Fresnel-like
  highlights.
- Uniform packing clamps hostile values and has pure unit coverage.
- Context loss, restoration, GPU allocation cleanup, and idempotent disposal are
  explicit.

## Plans 03-01 and 03-02 evidence

- The provider is server-safe, hydrates capabilities after mount, observes
  accessibility preferences, and exposes renderer, quality, and motion policy.
- The polymorphic glass primitive exposes semantic presets and advanced optical
  escape hatches without browser access during render.
- Pointer response writes transient CSS custom properties through refs and
  animation frames instead of rendering React state per frame.
- Source groups, deterministic SDF filter definitions, animated organic SVG
  filters, and a media-backed WebGL surface are implemented.
- The WebGL React surface is DPR-aware, supports video frame callbacks, pauses
  hidden-document drawing, redraws on resize, and fully releases observers,
  frames, listeners, and renderer resources.
- Twelve unit/SSR test files and fifty-six tests pass.

## Plans 04-01 and 04-02 evidence

- A single responsive showcase now has comparison home, five engine routes,
  architecture, and validation views.
- Every route carries the same instrument, parameter lab, six-background
  stress matrix, and accessible recipe inventory.
- Button, IconButton, segmented control, switch, slider, toolbar, dock, tabs,
  menu, popover, tooltip, and media controls are implemented as copy-owned
  recipes.
- Each route has an engine-specific art direction and implementation evidence.

## Plans 05-01 through 05-04 evidence

- Every route received a meaningful second-pass improvement.
- A real original H.264 source now drives motion and WebGL2 video refraction.
- Engine-specific layer legend, caustics, SDF fiducials, source ownership, and
  adaptive policy telemetry clarify the five different approaches.
- Route identity remounts state, preventing media/material leakage.
- Pass-02 contains 81 visually inspected screenshots across Chromium, Firefox,
  WebKit, desktop, and mobile.
- The adaptive hybrid scored 96 and is the final architecture recommendation.

## Plan 06-01 evidence

- Sixty unit/property/SSR/recipe tests pass.
- The second-pass functional suite passes 62 checks with four intentional
  capability skips across three browsers.
- Package tarballs install together in a clean consumer and pass export, peer,
  license, dependency, and tree-shaking checks.
- The isolated browser performance probe passes input, frame pacing, long-task,
  and teardown budgets.
- Architecture, report, validation, browser, performance, credit, and limitation
  documentation is complete.

## Plans 07-01 and 07-02 evidence

- The recipe package exposes forty native-DOM React components.
- A weighted ranking gives visual quality 50% of the decision and selects
  Adaptive Hybrid, Native CSS, and Spectral WebGL as finalists.
- `/library` explains the full five-engine decision; three finalist routes apply
  genuinely different material and layout strategies to the same forty controls.
- Sixty-five unit/property/SSR/recipe tests pass.
- Forty-two atlas-specific browser and screenshot checks pass across Chromium,
  Firefox, and WebKit.
- Two visual passes contain 84 ranking, hero, and representative component
  screenshots across desktop and mobile.
- Modal focus management, form labeling, semantic ranking markup, light-theme
  status contrast, and mobile boundaries were refined during the second pass.

## Release-candidate completion evidence

- `open-glass-ui@0.1.0-rc.0` is the single documented facade, with
  `open-glass-ui/core`, `open-glass-ui/styles.css`, and opt-in
  `open-glass-ui/webgl` subpaths.
- Neutral adaptive theming, custom accent/secondary/tertiary colors, and the
  combined `GlassSystemProvider` are complete.
- Eighty-eight unit tests pass across sixteen files.
- One hundred fifty-five browser checks pass across Chromium, Firefox, and
  WebKit with seven intentional capability-gated skips.
- Thirty-three final neutral/custom-accent/product-landing screenshots were
  regenerated and inspected across all three browser engines.
- The public landing now has a one-line sticky glass navigation capsule,
  interactive hero lenses, explicit material-anatomy studies, authoritative
  contour/distortion controls, and premium radius-matched CTA optics.
- `HANDOVER.md` and the `context/` pack now consolidate the original goal,
  research rationale, decisions, architecture/file maps, current state,
  next-step roadmap, and copy-paste agent handoff prompt.
- The packed facade passes React 18 SSR and declarations, Next.js RSC/static
  build, export, peer, license, tree-shaking, and WebGL-isolation checks.
- The public root bundles to 18,743 bytes with zero eager WebGL inputs.
- The final reference performance probe records 17.7 ms input-update p95,
  34.2 ms frame p95, no observed long tasks, and zero leaked media/GPU
  resources after teardown.
- `pnpm run release:check` is the publish-blocking gate and passed in full.
- No npm publication, GitHub remote creation, domain purchase, or deployment
  has occurred.
