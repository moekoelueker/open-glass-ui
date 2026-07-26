# OpenGlass UI Agent Instructions

## Required context

- Start every new workspace/session with `HANDOVER.md`.
- Use `context/README.md` to select the smallest relevant context set.
- Read `context/CURRENT-STATE.md` before changing release or publication posture.
- Treat source/tests and canonical topic docs as more authoritative than
  historical planning evidence.
- Update the handover/context pack in the same commit when a product,
  architecture, public API, route, brand, validation, or release decision
  changes.

## Scope

- Work only in this standalone repository.
- The sibling `old-liquid-glass-example` is read-only and must never be edited.
- Do not create a remote, push, deploy, or publish without explicit user approval.
- “OpenGlass UI” is the owner-approved public brand.
- Use `open-glass-ui` for the eventual public facade and repository slug.
- Use `@open-glass-ui/*` for workspace implementation packages.
- The name decision does not authorize creating a remote, deploying, or publishing.

## Architecture

- `packages/core` has zero runtime dependencies and no browser globals.
- `packages/renderers` owns browser/canvas/SVG capability.
- `packages/react` owns React composition and post-hydration capability policy.
- `packages/recipes` owns accessible component recipes and their CSS.
- `apps/showcase` may import workspace source through Vite aliases.
- React and React DOM remain peer dependencies of public-facing packages.
- Use refs or external animation values for high-frequency transient motion.

## Required checks

Run before committing implementation work:

```bash
pnpm run check
pnpm run typecheck
pnpm run test:unit
pnpm run build
```

Run browser tests and visually inspect their screenshots for user-facing changes.

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
