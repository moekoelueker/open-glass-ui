# Prism Lab

Prism Lab is an internal, clean-room React/web research repository comparing
five materially different approaches to refractive interface materials.

> **Status:** active research prototype. The name and package namespace are not
> approved for publication. No remote repository or package has been published.

## Experiments

1. Layered CSS material.
2. Organic SVG turbulence/displacement.
3. Geometric SDF displacement applied through SVG.
4. WebGL2 controlled-media refraction.
5. Adaptive hybrid renderer selection.

All five experiments use the same interaction and difficult-background suite so
their quality can be compared rather than merely admired in isolation.

## Workspace

```text
apps/showcase       comparison site and five experiment routes
packages/core       framework-independent optical geometry and maps
packages/renderers  CSS, SVG, SDF/DOM, WebGL2, and adaptive renderers
packages/react      SSR-safe React primitives and capability policy
packages/recipes    accessible copy-owned component recipes
examples/next       SSR and hydration compatibility fixture
tests               workspace and browser validation
```

## Commands

```bash
pnpm install
pnpm dev
pnpm run check
pnpm run typecheck
pnpm run test:unit
pnpm run build
pnpm run test:e2e
```

## Principles

- Glass is a selective functional layer, not the default content surface.
- Browser capability determines the renderer; unsupported effects have an
  intentional fallback.
- Text, semantics, focus, and interaction remain DOM-native.
- Optical inputs map to coherent concepts and have tested bounds.
- Pointer animation does not flow through React state on every frame.
- Experimental browser APIs are research adapters, not v1 foundations.

See [CREDITS.md](./CREDITS.md), [browser support](./docs/BROWSER-SUPPORT.md),
and [known limitations](./docs/LIMITATIONS.md).

## License

MIT. See [LICENSE](./LICENSE).

This independent project is not affiliated with, endorsed by, or sponsored by
Apple Inc.

