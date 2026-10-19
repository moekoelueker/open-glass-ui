# OpenGlass UI: agent brief

OpenGlass UI is a free, MIT-licensed liquid-glass component library for React: CSS-first glass materials, an opt-in WebGL2 renderer for owned media, forty accessible native-DOM recipes and neutral adaptive theming.
Status: `open-glass-ui` 0.4.0 is published on npm (2026-09-29, trusted publishing with signed provenance). This repository is the public pnpm workspace behind it, with the showcase app.

## Required context

- Start every session with `docs/handoff/CURRENT.md`, then `docs/handoff/HANDOVER.md`.
- Use `context/README.md` to select the smallest relevant context set.
- Read `context/CURRENT-STATE.md` before changing release or publication posture.

## Hard rules

- Do not create a remote, push, deploy, or publish without explicit user approval.
- Work only in this standalone repository.
- The sibling `old-liquid-glass-example` is read-only and must never be edited.
- “OpenGlass UI” is the owner-approved public brand.
- Use `open-glass-ui` for the public package and repository slug.
- `@open-glass-ui/*` are private build-time boundaries. Their code and
  declarations are inlined into `open-glass-ui`; they are never published, and
  they must never appear in consumer-facing examples.
- The name decision does not authorize creating a remote, deploying, or publishing.
- Releases go out only through a pushed `v*` tag and `.github/workflows/release.yml` (npm trusted publishing). No npm token exists; never add one.
- This repository is public. Tracked files hold technical notes only: no credentials, local paths, personal details or business plans.
- The visual-capture end-to-end specs overwrite the committed evidence under `artifacts/screenshots`. Do not run them casually; restore with `git checkout -- artifacts`.
- Treat source/tests and canonical topic docs as more authoritative than
  historical planning evidence.
- Update the handover/context pack in the same commit when a product,
  architecture, public API, route, brand, validation, or release decision
  changes.

## Commands

- Install: `pnpm install` (pnpm 11, Node 22 or newer). Dev: `pnpm dev` (the showcase at http://127.0.0.1:4173/).

## Required checks

Run before committing implementation work:

```bash
pnpm run check
pnpm run typecheck
pnpm run test:unit
pnpm run build
```

Run browser tests and visually inspect their screenshots for user-facing changes.
Browser tests: `pnpm run test:e2e` (serialized with retries). Package checks: `pnpm run verify:packages`. Benchmarks: `pnpm run bench:optics`, `pnpm run bench:browser`.

Before a release: `pnpm run release:check` (generated CSS and package README in sync, all checks, packages, browser tests and benchmarks). Versions go through changesets (`pnpm changeset`, `pnpm version:packages`); `CHANGELOG.md` is the release history. Steps: `docs/RELEASE-CHECKLIST.md`.

## Architecture

- `packages/core` has zero runtime dependencies and no browser globals.
- `packages/renderers` owns browser/canvas/SVG capability.
- `packages/react` owns React composition and post-hydration capability policy.
- `packages/recipes` owns accessible component recipes and their CSS.
- `packages/ui` is the one published package, `open-glass-ui`, with the `core`, `styles.css` and `webgl` subpaths.
- `apps/showcase` may import workspace source through Vite aliases.
- React and React DOM remain peer dependencies of public-facing packages.
- Use refs or external animation values for high-frequency transient motion.

## Map

- `docs/handoff/CURRENT.md`: where things stand right now. Read it before starting work.
- `docs/handoff/HANDOVER.md`: the full maintainer handover (product, research, architecture, operations). `docs/handoff/HANDOVER-PROMPT.md`: a prompt to paste into a new session.
- `docs/DECISIONS.md`: settled decisions, D-001 onward.
- `context/`: the fast orientation pack (`README.md` picks the smallest relevant set; `CURRENT-STATE.md`, `NEXT-STEPS.md`, `FILE-MAP.md`, `ARCHITECTURE-MAP.md`, `PRODUCT-BRIEF.md`, `RESEARCH-SUMMARY.md`).
- `docs/`: topic documentation (architecture, components, theming, renderers, accessibility, performance, validation, limitations, release checklist).
- `apps/showcase/`: landing, component catalog, research routes. `examples/`, `tests/` (unit, end to end), `scripts/` (generators, benchmarks, release guards), `artifacts/` (screenshot evidence).
- `llms.txt` and `llms-full.txt`: machine-readable references for AI tools.

## Commits

- One focused commit per task.
- Format: `{type}({phase}-{plan}): {task description}`.
- Preserve prior commits; do not rewrite history unless the user explicitly asks.

## Visual quality

- Use glass selectively for controls and navigation.
- Maintain sharp typography and measurable contrast.
- Each experiment must have a genuinely distinct engine and art direction.
- Avoid generic purple/cyan gradient glassmorphism.
- Treat reduced motion, reduced transparency, and forced colors as designed states.

## Session close

Run the `session-close` skill at the end of substantial work. Routing for this repo:
- Decisions: `docs/DECISIONS.md`, the next `D-NNN` at the bottom (**Decision:**, **Why:**, consequences).
- Current state: rewrite `docs/handoff/CURRENT.md` (80 lines max), and update `context/CURRENT-STATE.md` and `context/NEXT-STEPS.md` when the pack's maintenance rule applies.
- Dated handoff: `docs/handoff/YYYY-MM-DD.md`. Releases: a changeset, which feeds `CHANGELOG.md`.
- This repository is public: decisions and handoffs here hold technical notes only. Anything private belongs in the owner's private notes, outside this repository.
