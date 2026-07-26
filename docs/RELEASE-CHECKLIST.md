# Release Checklist

This checklist gates every release. Publication happens from the tagged GitHub
Actions workflow with npm provenance. No npm
publication, GitHub remote, domain purchase, or deployment is authorized by
this checklist.

Run this checklist against the exact commit and artifacts intended for release.

## Identity and legal

- [ ] Recheck `open-glass-ui`, relevant `@open-glass-ui/*` scopes, repository
      slugs, and intended domains immediately before reservation.
- [ ] Complete a confusing-similarity trademark and common-law search for
      related software/design-system goods; exact-name absence is not clearance.
- [ ] Confirm the release uses the owner-approved display name **OpenGlass UI**,
      package/repository slug `open-glass-ui`, and runtime prefix `ogui`.
- [ ] Include the MIT license and all required third-party notices/credits in
      source archives and package tarballs.
- [ ] Keep the non-affiliation notice: OpenGlass UI is independent and is not
      affiliated with, endorsed by, or sponsored by Apple Inc.
- [ ] Confirm no Apple assets, proprietary fonts, screenshots, or implied
      pixel-parity claims are present.
- [ ] Obtain explicit owner authorization before creating a remote, publishing,
      buying a domain, or deploying.

## Public API and packaging

- [ ] Freeze the `open-glass-ui` facade exports and semver policy.
- [ ] Verify normal consumers need only `open-glass-ui`.
- [ ] Verify `open-glass-ui/styles.css` includes recipe CSS and is marked as a
      package side effect.
- [ ] Verify `open-glass-ui/webgl` is the only documented WebGL entry and does
      not enter a CSS-only bundle.
- [ ] Keep React and React DOM as peer dependencies supporting React 18+.
- [ ] Confirm ESM and declaration files resolve through every declared export.
- [ ] Install packed tarballs into clean Vite and Next.js consumers; do not
      validate only through workspace aliases.
- [ ] Test tree shaking with a minimal import.
- [ ] Publish the `@open-glass-ui/*` implementation packages at the exact
      versions referenced by the facade. They are public dependency-chain
      infrastructure, not documented consumer entry points.
- [ ] Add verified `repository`, `homepage`, and `bugs` URLs to every manifest
      only after the authorized remote exists; do not ship placeholder URLs.
- [ ] Generate and inspect the final tarball contents before publishing.

## Required repository checks

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run typecheck
pnpm run test:unit
pnpm run build
pnpm run verify:packages
pnpm run test:e2e
pnpm run bench:optics
pnpm run bench:browser
```

- [ ] All commands pass from a clean checkout on the release toolchain.
- [ ] CI runs the same checks without undeclared local files or secrets.
- [ ] Generated output contains no workspace-only import, source alias, or
      unpublished dependency.
- [ ] Release notes state browser support, known limitations, and breaking
      changes without overclaiming.

## Renderer and runtime matrix

- [ ] CSS-first `auto` is the default in every supported environment.
- [ ] Explicit SDF/SVG works where supported and falls back cleanly where not.
- [ ] `open-glass-ui/webgl` handles ready, unavailable, lost, restored, error,
      and disposed states.
- [ ] Original media and DOM controls remain usable without WebGL.
- [ ] Strict-mode remount, route transition, resize, hidden-document,
      mount/unmount, and source replacement leave no frames, observers,
      listeners, video callbacks, or GPU objects behind.
- [ ] Chromium, Firefox, and WebKit pass at desktop and mobile viewports.
- [ ] Representative physical iOS, Android, macOS, and Windows devices pass.
- [ ] Browser-specific screenshots receive human review; passing a pixel diff
      alone is not approval.

## Accessibility

- [ ] Automated accessibility checks report no critical violations.
- [ ] Every recipe has an accessible name, role, state, relationship, visible
      focus, disabled behavior, and keyboard path.
- [ ] Menus, popovers, dialogs, drawers, tabs, and accordions pass manual
      keyboard and focus-restoration review.
- [ ] Light/dark, reduced motion, reduced transparency, forced colors, and
      no-enhancement fallbacks pass.
- [ ] Normal text reaches 4.5:1; large text, essential boundaries, focus, and
      state indicators reach 3:1 on actual difficult backgrounds.
- [ ] VoiceOver on macOS/iOS and NVDA on Windows pass representative workflows.
- [ ] 200–400% zoom, reflow, mobile orientation, and touch targets pass on
      physical devices.
- [ ] Documentation says WCAG 2.2 AA target, not certification.

## Performance

- [ ] Record optics generation, input response, frame pacing, long tasks, memory,
      and teardown on the release commit.
- [ ] Low-quality maps meet the interaction budget; medium/high work is cached,
      deferred, or moved off the interaction path.
- [ ] Position-only movement does not regenerate maps or set React state per
      pointer frame.
- [ ] CSS-only and WebGL subpath bundle sizes are measured independently.
- [ ] WebGL is tested on representative integrated/mobile GPUs, not only a
      headless or software-backed context.
- [ ] Performance claims identify hardware, browser, build mode, and method.

## Documentation and AI consumers

- [ ] README, component, theme, renderer, accessibility, browser, performance,
      limitation, and migration guidance match the final exports.
- [ ] Every code example type-checks against the packed facade.
- [ ] `llms.txt` routes to current canonical docs.
- [ ] `llms-full.txt` contains no stale package names, internal imports, or
      unsupported claims.
- [ ] AI guidance defaults to CSS, semantic DOM, public imports, and explicit
      WebGL opt-in.
- [ ] Publication status and non-affiliation appear in release-facing copy.

## Publication stop point

Only after every applicable item is checked and the owner explicitly authorizes
publication:

- [ ] Reserve or confirm the package/repository namespace.
- [ ] Create the authorized remote and push the reviewed commit.
- [ ] Add and verify the real repository, homepage, and issue-tracker metadata.
- [ ] Publish the single `open-glass-ui` package with provenance from the
      reviewed CI workflow. The `@open-glass-ui/*` workspace packages are
      private build-time boundaries and are never published.
- [ ] Install the published version into a clean external fixture.
- [ ] Verify documentation URLs, package metadata, license, types, and subpath
      imports from the public registry.
- [ ] Tag the exact published commit and record artifact checksums.

If any final registry, legal, accessibility, packaging, or clean-install check
changes the release posture, stop and resolve it before publication.
