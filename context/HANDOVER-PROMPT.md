# Copy-Paste Handover Prompt

Replace `<REPOSITORY_PATH>` if the new workspace uses a different path. Give the
new agent the repository along with this prompt.

```text
You are taking over the OpenGlass UI project.

Repository root:
<REPOSITORY_PATH>

Product:
OpenGlass UI is an independent, MIT-licensed React 18+ and web design system for
premium glass-like interfaces. It contains forty accessible native-DOM React
components, neutral adaptive themes, a CSS-first material system, explicit
SVG/SDF enhancement, and opt-in controlled-media WebGL2.

Current posture:
- Local open-glass-ui@0.1.0 release candidate.
- Product feature baseline is commit 1d5c46c.
- Not published to npm.
- No public GitHub remote or deployment is authorized by the repository.
- No domain or trademark clearance should be claimed.
- OpenGlass UI is not affiliated with or endorsed by Apple.

Before doing any work:
1. Read AGENTS.md completely.
2. Read HANDOVER.md completely.
3. Read context/README.md and context/CURRENT-STATE.md.
4. Read only the additional context files relevant to the task:
   - product/design: context/PRODUCT-BRIEF.md and context/DECISIONS.md
   - research/positioning: context/RESEARCH-SUMMARY.md
   - architecture/packages: context/ARCHITECTURE-MAP.md
   - file ownership: context/FILE-MAP.md
   - roadmap/release: context/NEXT-STEPS.md
5. Run git status --short and preserve unrelated user changes.

Settled product rules:
- The owner-approved brand is OpenGlass UI.
- Normal consumers import from open-glass-ui and open-glass-ui/styles.css.
- Pure/server utilities use open-glass-ui/core.
- GPU functionality uses open-glass-ui/webgl.
- Never use internal @open-glass-ui/* imports in consumer examples.
- renderer="auto" is CSS-first.
- SVG/SDF is explicit.
- WebGL is opt-in and only for an owned image, canvas, or video.
- Keep text, controls, focus, and state in semantic DOM.
- Neutral high-contrast light/dark themes are the default.
- Accents are optional and customizable.
- Reduced motion, reduced transparency, forced colors, SSR, hydration, and
  lifecycle cleanup are part of the product contract.
- Preserve the forty-component surface unless an intentional API decision
  changes it.
- Keep the product landing focused on one library. Renderer comparisons remain
  under /research and /library.
- Preserve selected irregular/morphing formed geometry and premium optical depth,
  but do not weaken legibility.
- Do not claim physical accuracy, Apple parity, public registry availability, or
  legal clearance.

Repository boundaries:
- packages/core: pure geometry/optics/theme/quality/cache; no browser or React.
- packages/renderers: CSS/SVG/WebGL capability and renderer code.
- packages/react: React providers/primitives/lifecycle.
- packages/recipes: forty accessible components and public CSS.
- packages/ui: single public facade.
- apps/showcase: landing, catalogs, research, validation, and demos.
- examples/next: public-facade Next.js compatibility fixture.
- The sibling old-liquid-glass-example is read-only and must not be edited.

Important routes:
- / — product landing
- /components — canonical component catalog
- /research — five-engine research
- /library — weighted ranking
- /library/hybrid, /library/css, /library/webgl — finalist atlases
- /docs and /validation — integration and evidence

Current validation reference:
- 97 files pass Biome.
- 105 unit/property/SSR/lifecycle/recipe tests pass.
- 161 browser checks have been validated across Chromium, Firefox, and WebKit,
  with seven intentional skips.
- The landing matrix is 33/33.
- React 18 packed consumers and a Next.js 16 RSC/static fixture pass.
- The public root has zero eager WebGL inputs.
- See docs/VALIDATION.md for the authoritative details and caveats.

Required behavior:
- For a request to explain, review, or diagnose, inspect and report; do not make
  unrelated external changes.
- For a request to change/build, implement it, run proportionate checks, visually
  inspect user-facing work, and make one focused commit.
- Use apply_patch for source edits.
- Preserve historical evidence directories.
- Update HANDOVER.md/context files when product, architecture, route, public API,
  validation, brand, release posture, or roadmap decisions change.

Checks:
- Fast: pnpm run check
- Types: pnpm run typecheck
- Unit: pnpm run test:unit
- Build: pnpm run build
- Packages: pnpm run verify:packages
- Browsers: pnpm run test:e2e
- Full gate: pnpm run release:check

The browser suite is intentionally serialized with bounded retries because
parallel WebGL/backdrop pages can oversubscribe local GPU/compositor resources.

External-action boundary:
Do not create or push a remote, publish npm packages, deploy, purchase/configure
a domain, or make credentialed external mutations unless the user explicitly
authorizes that exact action.

At the start of your response, briefly confirm:
1. The current product/release posture.
2. Which context files you read.
3. What you intend to do for the user’s current request.

Then proceed autonomously within the authorized scope.
```

## Compact version

Use this only when the repository and full context pack are already present:

```text
Take over the OpenGlass UI repository. Read AGENTS.md, HANDOVER.md,
context/README.md, and context/CURRENT-STATE.md before acting. Preserve the
settled CSS-first public contract: open-glass-ui facade, semantic DOM, explicit
SVG/SDF, opt-in owned-media WebGL, neutral adaptive themes, forty accessible
components, and no Apple/physical-accuracy claims. Run git status, preserve user
changes, use the task-specific context files, implement and verify the requested
work, update the context pack when decisions change, and make one focused
commit. Do not create a remote, publish, deploy, buy/configure a domain, or make
other external changes without explicit authorization.
```
