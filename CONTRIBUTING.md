# Contributing to OpenGlass UI

Contributions are welcome. The project is pre-`1.0`, so the API is still moving;
that makes this a good time to influence it.

## Good first contributions

- Reproduce and fix a rendering bug in a specific browser.
- Improve keyboard or screen-reader behavior on an existing component.
- Add a missing variant or prop that a real product needed.
- Improve documentation, especially anything that misled you.
- Add a framework example (Remix, Astro, Vite, TanStack Start).

Issues labelled `good first issue` are scoped to be self-contained.

Please open an issue before starting a **new component** or a **renderer
change**. The component surface is deliberately bounded, and the renderer policy
is a settled architectural decision — see
[docs/RENDERERS.md](./docs/RENDERERS.md) — so those need discussion first.

## Setup

Requires Node 22+ and pnpm 11.

```sh
pnpm install
pnpm dev            # showcase at http://127.0.0.1:4173
```

## Before opening a pull request

```sh
pnpm run check      # lint and format
pnpm run typecheck
pnpm run test:unit
pnpm run build
```

For anything user-visible, also run `pnpm run test:e2e` and look at the
screenshots. The browser suite is deliberately serialized: parallel WebGL and
`backdrop-filter` pages oversubscribe local GPU and compositor resources and
produce false failures.

CI runs the same commands. `pnpm run release:check` is the full publish gate.

## What reviewers look for

**Accessibility is not optional.** Every visual effect needs a defined behavior
under `prefers-reduced-motion`, `prefers-reduced-transparency`, and
`forced-colors`, and those states should look intentional rather than broken.
Keyboard support, focus management, and ARIA semantics must survive the change.

**Keep optics separate from semantics.** Components own behavior and markup;
the material layer owns appearance. A component should not grow its own bespoke
visual effect.

**No browser globals during render.** Capability detection happens after
hydration. Server output must stay deterministic.

**Keep high-frequency motion out of React state.** Use refs or CSS custom
properties for per-frame values, as `useGlassPointerField` does.

**Tests come with behavior.** Optical math, capability policy, and public
component behavior all need coverage.

**Licensing.** Do not add code or assets without a verified compatible license.
Record direct adaptations in [CREDITS.md](./CREDITS.md).

## Commits and changesets

Commits use `{type}({scope}): {description}`.

User-facing changes need a changeset:

```sh
pnpm changeset
```

Only `open-glass-ui` is published, so that is the only package a changeset ever
names. The `@open-glass-ui/*` workspace packages are private build-time
boundaries.

## Reporting bugs

Use the issue templates. A minimal reproduction matters more than a long
description — include browser, OS, React version, the renderer the surface
resolved to (`data-ogui-renderer` on the element), and any accessibility
preferences that were active.

Security issues follow [SECURITY.md](./SECURITY.md) instead — please do not open
a public issue for those.

## Code of conduct

Participation is governed by [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
