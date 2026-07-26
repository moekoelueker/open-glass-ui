# OpenGlass UI

**The open-source Liquid Glass UI system for React and the web.**

OpenGlass UI is a clean-room component and rendering system for premium
refractive interfaces. It combines semantic React components, neutral adaptive
themes, a CSS-first material layer, optional SVG refraction, and explicitly
opt-in WebGL for controlled media. Its research showcase compares five
materially different rendering approaches, while the forty-component atlas
applies the three strongest strategies to the same production interface.

> **Status:** local `0.1.0-rc.0` release candidate under active hardening. The
> owner has selected the OpenGlass UI identity, `open-glass-ui` package slug, and
> `@open-glass-ui/*` implementation namespace. No remote repository, deployment,
> or npm registry release has been created or published.

## Maintainer and AI handover

New maintainers and AI workspaces should begin with:

- [Project handover](./HANDOVER.md)
- [Context-pack index](./context/README.md)
- [Copy-paste handover prompt](./context/HANDOVER-PROMPT.md)

The context pack captures the original goal, research rationale, settled
decisions, architecture/file maps, current validation state, and launch roadmap
without requiring a full repository read.

## Experiments

1. Layered CSS material.
2. Organic SVG turbulence/displacement.
3. Geometric SDF displacement applied through SVG.
4. WebGL2 controlled-media refraction.
5. Adaptive hybrid capability and fallback policy.

All five experiments use the same interaction and difficult-background suite so
their quality can be compared rather than merely admired in isolation.

## Workspace

```text
apps/showcase       comparison site and five experiment routes
packages/core       framework-independent optical geometry and maps
packages/renderers  CSS, SVG, SDF/DOM, WebGL2, and adaptive renderers
packages/react      SSR-safe React primitives and capability policy
packages/recipes    accessible copy-owned component recipes
packages/ui         single consumer-facing open-glass-ui package facade
examples/next       SSR and hydration compatibility fixture
tests               workspace and browser validation
```

## Public package contract

After publication, consumers install one package and import its stylesheet once:

```bash
pnpm add open-glass-ui react react-dom
```

```tsx
import "open-glass-ui/styles.css";
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";

export function Example() {
  return (
    <GlassSystemProvider
      renderer="auto"
      theme={{ appearance: "system", theme: { preset: "neutral" } }}
    >
      <Glass material="regular">
        <Button variant="primary">Continue</Button>
      </Glass>
    </GlassSystemProvider>
  );
}
```

`renderer="auto"` is deliberately CSS-first. Controlled-media WebGL is isolated
behind the optional `open-glass-ui/webgl` entry point. Server components, build
tools, and non-React adapters can import pure utilities from
`open-glass-ui/core` without loading the React client boundary.

## Commands

```bash
pnpm install
pnpm dev
pnpm run check
pnpm run typecheck
pnpm run test:unit
pnpm run build
pnpm run test:e2e
pnpm exec playwright test tests/e2e/visual-capture.spec.ts
pnpm run bench:optics
pnpm run bench:browser
pnpm run verify:packages
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) after `pnpm dev`. The five
comparison routes live at:

```text
/experiments/css
/experiments/organic
/experiments/sdf
/experiments/webgl
/experiments/hybrid
```

The documentation and live evidence ledger are at `/docs` and `/validation`.
The weighted ranking and finalist component atlases are at:

```text
/library
/library/hybrid
/library/css
/library/webgl
```

## Principles

- Glass is a selective functional layer, not the default content surface.
- Neutral light and dark themes are the default; accent colors are optional.
- Browser capability gates explicitly requested enhanced renderers; unsupported
  effects have an intentional fallback.
- Text, semantics, focus, and interaction remain DOM-native.
- Optical inputs map to coherent concepts and have tested bounds.
- Pointer animation does not flow through React state on every frame.
- Experimental browser APIs are research adapters, not v1 foundations.

Start with:

- [Architecture](./docs/ARCHITECTURE.md)
- [Component API](./docs/COMPONENTS.md)
- [Theming](./docs/THEMING.md)
- [Renderer selection](./docs/RENDERERS.md)
- [Accessibility](./docs/ACCESSIBILITY.md)
- [AI-agent usage](./docs/AI-USAGE.md)
- [Release checklist](./docs/RELEASE-CHECKLIST.md)
- [Experiment report](./docs/EXPERIMENT-REPORT.md)
- [Component atlas and weighted ranking](./docs/COMPONENT-ATLAS.md)
- [Validation evidence](./docs/VALIDATION.md)
- [Browser support](./docs/BROWSER-SUPPORT.md)
- [Performance](./docs/PERFORMANCE.md)
- [Migration](./docs/MIGRATION.md)
- [Changelog](./CHANGELOG.md)
- [Credits and prior art](./CREDITS.md)
- [Known limitations](./docs/LIMITATIONS.md)

## License

MIT. See [LICENSE](./LICENSE).

This independent project is not affiliated with, endorsed by, or sponsored by
Apple Inc.
