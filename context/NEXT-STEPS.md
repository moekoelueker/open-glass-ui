# Next Steps

This roadmap begins after the completed local release candidate. It is ordered
to minimize the chance of marketing or publishing a package before the external
release facts are ready.

## Phase 1 — Owner launch decisions

### 1. Confirm the release target

Decide whether the first public release should be:

- `0.1.0-rc.0` under a prerelease tag, or
- A revised pre-1.0 version after another API pass.

Define the pre-1.0 support and breaking-change policy.

### 2. Refresh identity and namespace evidence

Immediately before reservation:

- Recheck `open-glass-ui` on npm.
- Recheck required `@open-glass-ui/*` implementation packages.
- Recheck the intended GitHub repository slug under the actual owner/org.
- Recheck any intended domain.
- Complete a human confusing-similarity/common-law search.

Do not treat the July 2026 automated research as a reservation or legal
clearance.

### 3. Obtain explicit authorization

The owner must explicitly authorize:

- Remote creation.
- Push.
- npm namespace/package reservation.
- Deployment.
- Domain purchase/configuration.

Do not bundle these approvals into unrelated local work.

## Phase 2 — External repository and CI

After authorization:

1. Create the GitHub repository.
2. Add the verified `repository`, `homepage`, and `bugs` metadata.
3. Push the reviewed commit.
4. Configure protected branch/release policies.
5. Configure GitHub Actions using a frozen lockfile.
6. Run the same `release:check` used locally.
7. Configure browser dependencies and artifact retention.
8. Configure npm trusted/OIDC provenance publishing.
9. Ensure secrets are environment-scoped and never committed.
10. Test a release dry run without publishing.

The owner previously indicated that GitHub CI/browser tests and npm OIDC
publishing would be configured as a separate step. Preserve that separation.

## Phase 3 — Physical and manual release QA

### Browser/device matrix

- Physical iOS Safari.
- Physical Android Chrome.
- macOS Safari, Firefox, and Chrome.
- Windows Edge, Chrome, and Firefox.
- Representative integrated and mobile GPUs.

### Accessibility

- VoiceOver on macOS and iOS.
- NVDA on Windows.
- Keyboard-only overlay/form workflows.
- 200%, 300%, and 400% zoom/reflow.
- Touch target and orientation review.
- Reduced motion.
- Reduced transparency where available.
- Forced colors/high contrast.

### Performance

- Real-device frame pacing.
- Input latency.
- Memory/GPU resource use.
- Long tasks.
- Teardown after source swaps, route changes, and backgrounding.
- CSS-only and WebGL bundle budgets in external consumers.

### Package consumers

- Clean Vite React 18 app.
- Clean Vite React 19 app.
- Next.js App Router with server/client boundaries.
- CSS-first usage with no WebGL in the graph.
- Explicit WebGL subpath usage.
- SVG/SDF fallback behavior.

## Phase 4 — API and documentation freeze

1. Review every public export.
2. Remove accidental internals.
3. Confirm controlled/uncontrolled naming consistency.
4. Confirm theme and renderer types.
5. Confirm stylesheet side-effect behavior.
6. Type-check every public example against the packed facade.
7. Refresh README, llms files, docs, context pack, changelog, and limitations.
8. Record final tarball contents and checksums.

Do not expand v1 with new components merely to increase the count. Prioritize
coherence and reliability.

## Phase 5 — Launch assets and education

### Landing

- Replace the GitHub placeholder after the real repository exists.
- Use the actual npm command only after publication.
- Add verified repository, documentation, and issue links.
- Add production social/share imagery and a canonical URL.
- Consider bundle/preload optimization for the public landing without weakening
  its live demonstrations.

### Launch video

Suggested narrative:

1. The problem with one-effect glass demos.
2. Five engines tested under the same burden.
3. Why CSS-first hybrid won.
4. Live landing material controls.
5. Forty accessible components.
6. Neutral/custom theming.
7. AI-agent integration.
8. WebGL opt-in over owned media.
9. Installation and GitHub.

### moluker.com article

Suggested article:

**Working title:** “Building OpenGlass UI: From Liquid Glass Effect to an
Accessible React Design System”

Suggested sections:

1. Why another glass library.
2. What the existing ecosystem gets right and misses.
3. The browser source-sampling problem.
4. Five engine experiments.
5. Why the best screenshot did not automatically win.
6. CSS-first hybrid architecture.
7. Physics-inspired geometry and optical vocabulary.
8. Forty DOM-native components.
9. Accessibility and fallback design.
10. AI-friendly package/documentation design.
11. Performance and lifecycle validation.
12. Lessons, limitations, and open-source invitation.

Use current screenshots from `artifacts/screenshots/open-glass-ui-final/`.
Refresh any volatile competitor/package facts before publishing.

## Phase 6 — Authorized publication

Only after the release checklist and explicit approval:

1. Publish the single `open-glass-ui` package. The `@open-glass-ui/*`
   workspace packages are private and inlined into it at build time.
2. Use provenance.
4. Install the public registry version into clean external fixtures.
5. Verify public exports, styles, types, metadata, license, and links.
6. Deploy the documentation/landing site.
7. Tag the exact commit.
8. Record checksums and release evidence.

Canonical procedure:
[`../docs/RELEASE-CHECKLIST.md`](../docs/RELEASE-CHECKLIST.md).

## Post-launch priorities

- Triage real integration feedback.
- Publish small migration guides for any pre-1.0 changes.
- Add examples for common frameworks without changing the core contract.
- Measure real bundle and device data.
- Expand component variants only when repeated consumer needs justify them.
- Consider adapters for other frameworks or React Native only as separately
  scoped projects.

## Optional improvements, not launch blockers

- Add a second video codec if the target browser matrix benefits.
- Create downloadable design tokens or a Figma companion after the code system
  stabilizes.
- Add a dedicated interactive material builder/exporter.
- Add visual regression baselines to hosted CI.
- Build a documentation search index.
- Add framework-specific recipes for Next.js, Remix, Astro, or Vite.
- Explore WebGPU or future HTML-in-Canvas APIs only behind research adapters.

## Liquid design follow-ups (added 2026-09-28)

State (2026-09-29): `open-glass-ui@0.4.0` is published on npm through
trusted publishing (OIDC, signed provenance, verified attestations), with the
GitHub release at `v0.4.0`. README media were regenerated (`pnpm
capture:media`) and moelueker.com/liquid-glass runs 0.4.0 (website PR #79).

Release path now: push a `v*` tag; `release.yml` runs the full gate and
publishes via the npm trusted publisher `moekoelueker/open-glass-ui`,
`release.yml`, environment `npm-publish`. Lessons from the first CI release:
setup-node `registry-url` silently disables OIDC (actions/setup-node#1551);
a stage-only token or a publisher without "Allow npm publish" cannot publish;
the WebGL-window perf budgets are only meaningful on the reference host.

1. Review `/compare` on a real Mac in Safari and on an iPhone. Headless WebKit
   does not composite `backdrop-filter`, so blur and saturation there are
   unverified.
2. Measure frame cost with many glass controls on screen (`bench:browser`,
   plus a low-end Android device). Each liquid control uses `backdrop-filter`.
   If it is too costly, gate control blur on `quality`.
3. Delete the stage-only npm token `open-glass-ui-github-release` on
   npmjs.com (the `NPM_TOKEN` secret is already gone; publishing uses
   trusted publishing only). The Gumroad product holds no files, only links
   to the repository and the website, so it needs no update per release.
4. Candidates for a later pass: a container that visually merges neighbouring
   glass shapes as they approach (gooey morphing), and liquid rules for the
   remaining low-traffic recipes (Stepper connectors, Breadcrumbs).
5. Do not run the visual-capture e2e specs casually: they overwrite the
   committed evidence under `artifacts/screenshots`. Restore with
   `git checkout -- artifacts` if that happens.
