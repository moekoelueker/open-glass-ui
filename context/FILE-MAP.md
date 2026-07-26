# File and Ownership Map

Use this map to locate a change without scanning the whole repository.

## Start-here files

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Repository rules and required checks |
| `HANDOVER.md` | Product, research, architecture, and operational handover |
| `context/README.md` | Task-specific reading routes |
| `README.md` | Public-facing repository introduction |
| `llms.txt` | Compact consumer-agent integration rules |
| `llms-full.txt` | Self-contained consumer-agent API reference |
| `.planning/STATE.md` | Historical phase/evidence ledger |

## Root configuration

| File | Purpose |
| --- | --- |
| `package.json` | Workspace commands and publish-blocking gate |
| `pnpm-workspace.yaml` | Workspace package membership |
| `pnpm-lock.yaml` | Locked dependency graph |
| `playwright.config.ts` | Browser projects, local server, evidence behavior |
| `biome.json` | Format/lint policy |
| `tsconfig.base.json` | Shared TypeScript behavior |
| `.changeset/` | Future versioning and release notes |
| `.github/` | Prepared repository automation/policies |
| `.env.example` | Optional local naming and future GitHub URL variables |

Never commit `.env.local` or secret keys.

## Product landing and showcase

| File | Owns |
| --- | --- |
| `apps/showcase/src/app.tsx` | Route selection, lazy boundaries, loading/error recovery |
| `apps/showcase/src/navigation.tsx` | SPA-aware semantic anchor behavior |
| `apps/showcase/src/landing-page.tsx` | Public product landing content, state, demos, copy actions |
| `apps/showcase/src/landing-page.css` | Landing art direction, responsive behavior, glass optics, accessibility modes |
| `apps/showcase/src/component-atlas.tsx` | Ranking, theme studio, forty-component catalogs |
| `apps/showcase/src/pages.tsx` | Research home, experiment/detail docs, validation views, shared site shell |
| `apps/showcase/src/engine-visuals.tsx` | Visual backdrops and engine-specific rendering demonstrations |
| `apps/showcase/src/data.ts` | Experiment content and engine data |
| `apps/showcase/src/styles.css` | Historical research/catalog site styling |
| `apps/showcase/src/icons.tsx` | Local icon abstraction |
| `apps/showcase/vite.config.ts` | Source aliases and `llms*.txt` serving/build output |
| `apps/showcase/index.html` | Product metadata and page title |
| `apps/showcase/public/assets/` | Original controlled demo photo/video assets |

### Landing section/function map

| Function/area | Purpose |
| --- | --- |
| `LandingHeader` | One-line header and sticky glass capsule |
| `LandingBackdrop` | Motion/photo/topography/chroma source environments |
| `HeroScore` | 94/100 evidence surface |
| `HeroControls` | Scene, material, colors, intensity, motion |
| `CreativeStudio` | Contours and distortion demonstration |
| `AnalyticsConsole` | Tabs, metrics, and pagination composition |
| `MaterialBuilder` | Step/form workflow composition |
| `FeedbackSystem` | Dialog/drawer/toast/feedback composition |
| `ScenarioExplorer` | Product use-case tab switcher |
| `CodePanel` | Copyable setup code |
| `LandingPage` | Complete public landing composition |

## Core package

| File | Owns |
| --- | --- |
| `packages/core/src/geometry.ts` | SDF geometry definitions/evaluation |
| `packages/core/src/math.ts` | Low-level finite/bounded math |
| `packages/core/src/displacement.ts` | Deterministic displacement-map generation |
| `packages/core/src/materials.ts` | Semantic optical material presets |
| `packages/core/src/quality.ts` | Quality profiles and policy |
| `packages/core/src/cache.ts` | Bounded LRU map cache |
| `packages/core/src/theme.ts` | Theme calculation, contrast, readable foregrounds |
| `packages/core/src/types.ts` | Framework-independent public types |
| `packages/core/src/index.ts` | Core public exports |

Core must remain browser- and React-free.

## Renderer package

| File | Owns |
| --- | --- |
| `packages/renderers/src/capabilities.ts` | Capability detection and CSS-first selection policy |
| `packages/renderers/src/css.ts` | CSS material tokens/fallback states |
| `packages/renderers/src/svg.ts` | SVG map/filter encoding |
| `packages/renderers/src/webgl.ts` | Shader renderer, resources, lifecycle |
| `packages/renderers/src/index.ts` | Non-WebGL renderer exports |

Keep WebGL imports isolated from normal root consumers.

## React package

| File | Owns |
| --- | --- |
| `packages/react/src/provider.tsx` | Runtime/capability/motion/quality provider |
| `packages/react/src/theme.tsx` | React theme provider and hydration behavior |
| `packages/react/src/glass.tsx` | Semantic `Glass` primitive |
| `packages/react/src/source.tsx` | `GlassGroup` and `GlassSource` |
| `packages/react/src/filters.tsx` | SVG/SDF/organic React filter definitions/hooks |
| `packages/react/src/interaction.ts` | Pointer/CSS-variable interaction behavior |
| `packages/react/src/webgl-surface.tsx` | Media-backed React WebGL surface/lifecycle |
| `packages/react/src/index.tsx` | Standard public React exports |
| `packages/react/src/webgl.ts` | Explicit WebGL subpath exports |

## Recipe and facade packages

| File | Owns |
| --- | --- |
| `packages/recipes/src/index.tsx` | Core controls, menus, popovers, media, common behavior |
| `packages/recipes/src/atlas.tsx` | Additional data, navigation, feedback, and form recipes |
| `packages/recipes/src/styles.css` | Shared public component styling and accessibility states |
| `packages/recipes/src/*.test.tsx` | Recipe behavior and API contracts |
| `packages/ui/src/index.tsx` | Public facade and combined `GlassSystemProvider` |
| `packages/ui/src/core.ts` | `open-glass-ui/core` forwarding entry |
| `packages/ui/src/webgl.ts` | `open-glass-ui/webgl` forwarding entry |
| `packages/ui/scripts/copy-styles.mjs` | Facade stylesheet packaging |

## Tests

| File | Scope |
| --- | --- |
| `tests/e2e/landing.spec.ts` | Product landing behavior, visual states, a11y, responsive, routing |
| `tests/e2e/component-atlas.spec.ts` | Ranking, forty recipes, atlas behavior, theme studio |
| `tests/e2e/showcase.spec.ts` | Five research engines, fallbacks, lifecycle, accessibility |
| `tests/e2e/performance.spec.ts` | Isolated browser performance/resource budgets |
| `tests/e2e/final-visual-capture.spec.ts` | Current release-candidate screenshots |
| `tests/e2e/atlas-visual-capture.spec.ts` | Historical atlas evidence |
| `tests/e2e/visual-capture.spec.ts` | Historical experiment evidence |
| `scripts/verify-packages.mjs` | Tarball, consumer, exports, React 18, tree-shaking, WebGL isolation |
| `scripts/benchmark-optics.mjs` | Framework-independent optics budgets |

The full visual/browser suite is serialized to avoid local GPU/compositor
oversubscription.

## Documentation routing

| Topic | Canonical file |
| --- | --- |
| Architecture | `docs/ARCHITECTURE.md` |
| Public components | `docs/COMPONENTS.md` |
| Theming/tokens | `docs/THEMING.md` |
| Renderer selection | `docs/RENDERERS.md` |
| Accessibility | `docs/ACCESSIBILITY.md` |
| Browser support | `docs/BROWSER-SUPPORT.md` |
| Performance | `docs/PERFORMANCE.md` |
| Validation | `docs/VALIDATION.md` |
| Known limitations | `docs/LIMITATIONS.md` |
| AI consumer guidance | `docs/AI-USAGE.md` |
| Migration | `docs/MIGRATION.md` |
| Research | `docs/RESEARCH.md` |
| Engine experiment record | `docs/EXPERIMENT-REPORT.md` |
| Ranking/component atlas | `docs/COMPONENT-ATLAS.md` |
| Brand | `docs/IDENTITY.md` |
| Naming research | `docs/NAMING-RESEARCH.md` |
| Release actions | `docs/RELEASE-CHECKLIST.md` |

## Evidence and generated files

| Path | Meaning |
| --- | --- |
| `artifacts/screenshots/open-glass-ui-final/` | Current release-candidate visual evidence |
| `artifacts/screenshots/pass-01/` | Historical engine research evidence |
| `artifacts/screenshots/pass-02/` | Historical engine research evidence |
| `artifacts/screenshots/atlas-pass-01/` | Historical atlas evidence |
| `artifacts/screenshots/atlas-pass-02/` | Historical atlas evidence |
| `artifacts/packages/` | Packed-package evidence |
| `artifacts/performance/` | Performance reports |

Do not rewrite historical screenshot directories during ordinary feature work.
Use the current release directory or a new explicitly named evidence pass.

Generated `dist/`, `.next/`, `test-results/`, `playwright-report/`, and
`node_modules/` content is not source.

## Change-routing examples

- Adjust CTA optics: `landing-page.css`, then `landing.spec.ts`, visual review.
- Add a theme token: `core/theme.ts`, React theme layer, recipe CSS, docs/tests.
- Change renderer policy: `renderers/capabilities.ts`, provider/tests, renderer
  docs, handover decisions.
- Add a component: recipe source/CSS/tests, facade export, docs, atlas, landing
  inventory, AI references, validation counts.
- Change public exports: facade plus package verifier, declarations, README,
  component/AI docs, context pack.
- Change launch status: identity/release/limitations docs, README, llms files,
  current state, handover prompt.

## Protected boundaries

- Do not edit the sibling `old-liquid-glass-example`.
- Do not rewrite Git history.
- Do not publish, deploy, create a remote, or buy a domain without explicit
  authorization.
- Do not commit secrets or raw NamingSignal credentials.
- Do not claim registry availability or legal clearance from old evidence.
