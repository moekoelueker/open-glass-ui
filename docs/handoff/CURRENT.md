# OpenGlass UI: current state

Rewritten in place at each session close (80 lines max). Written 2026-11-07 after the 0.5.1
release.

## Released

- `open-glass-ui` 0.5.1 (per-component tree shaking, D-026) is on npm since 2026-11-07, published
  by `release.yml` from the `v0.5.1` tag through npm trusted publishing with signed provenance.
  0.5.0 (the review fixes, D-023 to D-025) was published on 2026-11-06, 0.4.0 (the liquid design,
  D-022) on 2026-09-29.
- One published package with zero runtime dependencies and the `core`, `styles.css` and `webgl`
  subpaths; the `@open-glass-ui/*` packages stay private and are inlined at build time.
- `main` holds the merged branches (pull requests 3 and 4, merge commits) and their release commits.
- moelueker.com/liquid-glass runs 0.5.1 since 2026-11-07 (website pull request 130).

## What 0.5.1 changed

0.5.0's `forwardRef` on eleven recipes had no `@__PURE__` annotation, so a Button-only import
kept every `forwardRef` component (28.7 KB, 40% of the barrel; 0.4.0: 17.8 KB). All fifteen
top-level `forwardRef` calls are annotated and the liquid muted ink is built on call (tokens
identical across 1,080 option combinations). Button alone is 1,969 B packed (2.7%). Guards:
`tests/unit/tree-shaking.test.ts` and the `verify-packages` bound (under 3,000 B and 5%).

## What 0.5.0 changed

An adversarial review (independent model review plus a live browser pass and an npm consumer test)
found readability, layering, form and documentation defects. Fixed:

- Forced `tone` scopes the palette for text, nested surfaces and recipes (D-023).
- Accent ink reaches 4.5:1 on the whole liquid accent fill; the fill is opaque (D-023).
- One layer stack for dialogs, drawers, menus, popovers and tooltips (D-025). Events from portaled
  dialogs and menus no longer reach the Menu, Card or Toast that rendered them in React's tree.
- NumberField editing, Slider value, SearchField lock, Tooltip and Toast interaction, ARIA merging.
- forwardRef on eleven native-control recipes.
- WebGL surface gated by forced colors and reduced transparency; static redraws.
- Liquid rim no longer escapes static elements; nearest-scope guard handles nesting to depth 4.
- `llms.txt` and `llms-full.txt` rewritten, shipped in the package, tested against the exports.
- Tailwind v4 cascade-layer guide; token scoping and liquid tokens documented.
- Showcase: mobile GitHub link, atlas grid dead cells, hash deep links.

Rejected after measurement: painting the Glass material from the stylesheet (D-024).
Upgrade notes for consumers: `docs/MIGRATION.md`, "Upgrading from 0.4 to 0.5".

## Validation

Local `release:check` on 2026-11-07 (0.5.1): generated CSS and package README in sync, Biome
clean, typecheck, 383 unit tests in 30 files, `verify:packages` (React 18 consumer, Next.js 16
fixture), Playwright 182 passed and 7 intentional skips across Chromium, Firefox and WebKit, optics
bench. The Chromium frame-budget bench is host-sensitive (see `docs/PERFORMANCE.md`): it failed on
a loaded host for 0.5.1 and for the published 0.5.0 alike; the release workflow's clean-runner
gate decides. The browser suite rewrites historical captures and the benches rewrite
`artifacts/performance`; restore both before a release commit. 0.5.0 details: `2026-11-06.md`.

## Release path

Add a changeset, run `pnpm version:packages`, rewrite the generated entry into `CHANGELOG.md`
(delete `packages/ui/CHANGELOG.md`), run `pnpm run release:check`, merge into `main`, then push an
annotated `v*` tag; `release.yml` reruns the gate and publishes. Publishing needs explicit owner
approval. The repository allows only squash merges in the GitHub UI, so branches are merged
locally with `--no-ff` to keep task commits.

## Next

1. Review on a real Mac in Safari and on an iPhone (headless WebKit does not composite
   `backdrop-filter`): dialog scrim blur with the positioned layer hosts, liquid accent fills.
2. Screen-reader pass (VoiceOver) on Dialog with a Menu inside, Tooltip, NumberField.
3. One more independent pass over the overlay layer model (`packages/recipes/src/layers.ts`);
   the last review fix (15-13, dialog opener after autofocus) was not re-inspected.
4. Deferred from the review as low impact: a content backdrop behind the catalog specimens,
   curating the facade exports, splitting classic and liquid stylesheets.
5. `README.md` and `docs/VALIDATION.md` still quote 0.4.0 test counts (137 unit, 179 browser);
   0.5.1 has 383 unit tests and 182 browser checks with 7 skips. The npm README updates on release.

## Where to look

- `docs/handoff/2026-11-07.md`: the tree-shaking fix and the 0.5.1 release.
- `docs/handoff/2026-11-06.md`: the review, the fixes, the release and what failed.
- `docs/handoff/HANDOVER.md`: the full handover. `docs/DECISIONS.md`: D-023 to D-026.
