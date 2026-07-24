# State

- Internal name: Prism Lab
- Phase: optics core
- Completed plan: 00-01
- Next plan: 01-01
- Public name: unresolved by design
- Remote/publishing: not authorized
- Old example: read-only and outside this repository
- Next implementation: optics invariants and core geometry

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
