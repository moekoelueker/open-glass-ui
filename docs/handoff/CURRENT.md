# OpenGlass UI: current state

Rewritten in place at each session close (80 lines max). Written 2026-10-18 from `context/CURRENT-STATE.md` and `context/NEXT-STEPS.md` (status date 2026-09-29) and git; nothing was rebuilt or retested for this note.

## Released

- `open-glass-ui` 0.4.0 (the liquid design, D-022) is on npm since 2026-09-29, published by `release.yml` through npm trusted publishing with signed provenance; the GitHub release is `v0.4.0`.
- One published package with zero runtime dependencies and the `core`, `styles.css` and `webgl` subpaths; the `@open-glass-ui/*` packages stay private and are inlined at build time.
- `main` is at `4943bbf` (2026-09-29). The last commits were release and CI notes: no npm token or `NPM_TOKEN` secret exists any more.

## Release path

Push a `v*` tag; `release.yml` runs the full gate (`pnpm run release:check`) and publishes. Lessons from the first CI release: `setup-node`'s `registry-url` silently disables OIDC; the WebGL-window performance budgets are only meaningful on the reference host and are recorded, not gated, in CI.

## Next

1. Review `/compare` on a real Mac in Safari and on an iPhone. Headless WebKit does not composite `backdrop-filter`, so blur and saturation there are unverified.
2. Measure frame cost with many glass controls on screen (`pnpm run bench:browser`, plus a low-end Android device). If it is too costly, gate control blur on `quality`.
3. Later: a container that merges neighbouring glass shapes as they approach, and liquid rules for the remaining low-traffic recipes (Stepper connectors, Breadcrumbs).

## Still not done

- Physical-device GPU, zoom, orientation, touch and screen-reader review (VoiceOver, NVDA).
- Trademark clearance and a dedicated domain.

## Working tree

Visual-capture end-to-end runs overwrite `artifacts/screenshots`; at the time of writing four WebKit screenshots under `artifacts/screenshots/atlas-pass-02/` were modified and uncommitted. Treat unexpected changes as someone else's work.

## Where to look

- `docs/handoff/HANDOVER.md`: the full handover. `context/CURRENT-STATE.md`: the detailed state, routes and validation totals. `context/NEXT-STEPS.md`: the longer roadmap.
