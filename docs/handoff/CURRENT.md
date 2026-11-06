# OpenGlass UI: current state

Rewritten in place at each session close (80 lines max). Written 2026-11-06 after the 0.5.0
release.

## Released

- `open-glass-ui` 0.5.0 (the review fixes, D-023 to D-025) is on npm since 2026-11-06, published
  by `release.yml` from the `v0.5.0` tag through npm trusted publishing with signed provenance.
  0.4.0 (the liquid design, D-022) was published on 2026-09-29.
- One published package with zero runtime dependencies and the `core`, `styles.css` and `webgl`
  subpaths; the `@open-glass-ui/*` packages stay private and are inlined at build time.
- `main` holds the merged review-fix branch (pull request 3, merge commit) and the release commit.

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

## Validation (2026-11-06, release commit)

Local `release:check`: generated CSS and package README in sync, Biome clean, typecheck 7/7, 380
unit tests in 29 files, `verify:packages` (llms files in the tarball, React 18 consumer, Next.js 16
fixture), Playwright 182 passed and 7 intentional skips across Chromium, Firefox and WebKit, optics
bench. The Chromium frame-budget bench is host-sensitive (see `docs/PERFORMANCE.md`); the release
workflow's gate on a clean runner passed in full. Size: `dist/styles.css` 16.8 KB gzip,
`dist/index.js` 23.6 KB gzip.

Visual-capture specs now really emulate reduced motion (`contextOptions`); before 15-15 the option
was ignored. `open-glass-ui-final` was re-captured for 0.5.0; historical passes are unchanged.

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

## Where to look

- `docs/handoff/2026-11-06.md`: the review, the fixes, the release and what failed.
- `docs/handoff/HANDOVER.md`: the full handover. `docs/DECISIONS.md`: D-023 to D-025.
