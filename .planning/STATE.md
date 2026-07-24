# State

- Internal name: Prism Lab
- Phase: WebGL2 media rendering
- Completed plans: 00-01, 01-01, 01-02, 02-01
- Next plan: 02-02
- Public name: unresolved by design
- Remote/publishing: not authorized
- Old example: read-only and outside this repository
- Next implementation: WebGL2 source rendering, multi-lens shader, context recovery, and cleanup

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
- Adaptive selection uses controlled-media WebGL2, supplied-DOM SDF/SVG, and an
  intentional CSS fallback.
- Forced colors and reduced transparency always resolve to CSS/opaque material.
- SVG map encoding, stable map-specific IDs, conservative filter bounds, and RGB
  channel scale separation are implemented.
- Clear, regular, frosted, unsupported, reduced-transparency, and forced-colors
  CSS token sets are tested.
- Forty-two unit/property tests pass.
