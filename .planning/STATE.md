# State

- Internal name: Prism Lab
- Phase: optics quality and renderer foundations
- Completed plans: 00-01, 01-01
- Next plan: 01-02
- Public name: unresolved by design
- Remote/publishing: not authorized
- Old example: read-only and outside this repository
- Next implementation: quality tiers, bounded caching, map image encoding, and renderer contracts

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
