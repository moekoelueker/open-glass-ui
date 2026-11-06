# OpenGlass UI: current state

Rewritten in place at each session close (80 lines max). Written 2026-11-06 after the review-fix
branch `fix/2026-11-05-review-fixes`.

## Released

- `open-glass-ui` 0.4.0 (the liquid design, D-022) is on npm since 2026-09-29, published by
  `release.yml` through npm trusted publishing with signed provenance.
- One published package with zero runtime dependencies and the `core`, `styles.css` and `webgl`
  subpaths; the `@open-glass-ui/*` packages stay private and are inlined at build time.

## Unreleased (on the review-fix branch, changeset `review-fixes-2026-11`, minor)

An adversarial review (independent model review plus a live browser pass and an npm consumer test)
found readability, layering, form and documentation defects. Fixed:

- Forced `tone` scopes the palette for text, nested surfaces and recipes (D-023).
- Events from portaled dialogs and menus no longer reach the Menu, Card or Toast that rendered
  them in React's tree; layers opened from a toast follow modal isolation.
- Accent ink reaches 4.5:1 on the whole liquid accent fill; the fill is opaque (D-023).
- One layer stack for dialogs, drawers, menus, popovers and tooltips (D-025).
- NumberField editing, Slider value, SearchField lock, Tooltip and Toast interaction, ARIA merging.
- forwardRef on eleven native-control recipes.
- WebGL surface gated by forced colors and reduced transparency; static redraws.
- Liquid rim no longer escapes static elements; nearest-scope guard handles nesting to depth 4.
- `llms.txt` and `llms-full.txt` rewritten, shipped in the package, tested against the exports.
- Tailwind v4 cascade-layer guide; token scoping and liquid tokens documented.
- Showcase: mobile GitHub link, atlas grid dead cells, hash deep links.

Rejected after measurement: painting the Glass material from the stylesheet (D-024).

## Validation (2026-11-06, branch head)

Biome 130 files clean; typecheck 7/7; 380 unit tests in 29 files; build and `verify:packages`
pass (llms files in the tarball); generated CSS and package README in sync; Playwright 182 passed,
7 intentional skips across Chromium, Firefox and WebKit. A computed-style diff of five routes in
default, forced-colors and reduced-transparency modes against `3178ff6` shows only the intended
changes. Size: `dist/styles.css` 14.8 to 16.8 KB gzip (mostly the nesting guard), `dist/index.js`
19.4 to 23.6 KB gzip (layer stack, tone scoping, refs).

## Release path

Push a `v*` tag; `release.yml` runs the full gate (`pnpm run release:check`) and publishes. Run
`pnpm version:packages` first so the changeset becomes the 0.5.0 changelog entry. Publishing needs
explicit owner approval.

## Next

1. Review the branch on a real Mac in Safari and on an iPhone (headless WebKit does not composite
   `backdrop-filter`): dialog scrim blur with the positioned layer hosts, liquid accent fills.
2. Screen-reader pass (VoiceOver) on Dialog with a Menu inside, Tooltip, NumberField.
3. Deferred from the review as low impact: a content backdrop behind the catalog specimens,
   curating the facade exports, splitting classic and liquid stylesheets.

## Where to look

- `docs/handoff/2026-11-06.md`: what this session did and what failed.
- `docs/handoff/HANDOVER.md`: the full handover. `docs/DECISIONS.md`: D-023 to D-025.
