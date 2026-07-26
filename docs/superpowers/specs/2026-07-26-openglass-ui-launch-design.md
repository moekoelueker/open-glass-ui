# OpenGlass UI — Launch Design

Date: 2026-07-26
Status: awaiting owner approval
Baseline commit: `8bcc03f`

## Goal

Take OpenGlass UI from a validated local release candidate to a published,
contributable open-source library with a marketing home on moelueker.com.

## Owner decisions (settled 2026-07-26)

| Decision | Choice |
| --- | --- |
| npm name | Unscoped `open-glass-ui`, **single published package** |
| GitHub | New public `moekoelueker/open-glass-ui`; archive `moekoelueker/refract` |
| Site integration | Port landing to a Next.js route on moelueker.com; host full showcase separately |
| Slug | `moelueker.com/liquid-glass` |

## Verified starting state

Run locally on 2026-07-26, not taken from documentation:

- `biome check` — 97 files, clean.
- `pnpm run typecheck` — passes across all 9 workspace projects.
- `pnpm run test:unit` — 88/88 across 16 files.
- `pnpm run build` — passes, including the Next.js 16 RSC fixture.
- `pnpm run verify:packages` — passes: packed install, facade export smoke,
  facade styles, peer deps, React 18 compat + types, 0 core runtime deps,
  0 eager WebGL inputs in the root facade, 1,222-byte `signedDistance`
  tree-shake probe.

The library source is in good condition. The gaps are packaging, public
metadata, landing-page credibility, and release plumbing — not correctness.

---

## Section A — Packaging: five packages become one

### Problem

`packages/ui/package.json` declares `@open-glass-ui/{core,renderers,react,recipes}`
as `dependencies: "workspace:*"`. Publishing only `open-glass-ui` therefore ships
a package whose dependencies cannot resolve. The alternatives are to publish all
five, or to inline them.

### Decision

Publish **one** package. The four internal packages stay as build-time
boundaries and are bundled into the facade by tsup.

Rationale:

- The project's own rule already forbids consumers importing `@open-glass-ui/*`.
  Publishing packages nobody may import is liability with no benefit.
- One version number, one changelog, one thing to reserve, one thing to audit.
- Consumers already install exactly one package.
- Matches how single-install libraries ship (framer-motion, cmdk, sonner, vaul).

### Changes

1. `packages/ui/package.json`: remove the four `workspace:*` dependencies; the
   published package's only dependency contract becomes `peerDependencies`
   (react, react-dom).
2. `packages/ui` build: add `--no-external` handling so tsup inlines the
   workspace sources across the three entries (`index`, `core`, `webgl`), with
   ESM code-splitting so `open-glass-ui/core` and the root facade share chunks
   rather than duplicating.
3. Mark the four internal packages `"private": true` so no accidental publish is
   possible, and drop them from the changesets `fixed` group.
4. `scripts/verify-packages.mjs`: assert the published tarball has **zero**
   runtime `dependencies`, and keep the existing WebGL-isolation and
   tree-shaking probes green against the bundled output.

### Risk and how it is checked

Inlining could regress the WebGL-isolation guarantee (the root facade must pull
in zero eager WebGL inputs) or duplicate code across subpaths. Both are already
measured by `verify:packages`; the numbers must stay at 0 eager WebGL inputs and
the facade must not grow materially. If splitting misbehaves, fall back to
Section A's alternative (publish all five) — decided by evidence, not preference.

---

## Section B — Landing page

### B1. Remove the invented score (credibility)

`HeroScore` renders **"94 / 100 — Internal weighted library evaluation"** with a
98% "Capability fit" bar. This is the library grading itself, presented in the
visual language of an objective benchmark. On a public page it reads as
puffery and undermines the otherwise unusually honest positioning ("physics-
inspired, not physically accurate", "CSS implies rather than performs true
arbitrary-DOM refraction").

Replace it with a **live renderer readout** — the same glass panel, but showing
what the system is actually doing right now: active material, resolved renderer
and its reason (`css-first` / `accessibility-fallback` / `explicit`), tone, and
motion state, read from `useGlassRuntime()`. It keeps the composition, is more
interesting, demonstrates a real feature, and every number on it is true.

### B2. Replace placeholders with real facts

- `GITHUB COMING SOON` → real repository link once the repo exists.
- Install command is presented as "planned registry command" → becomes the real
  command post-publish.
- Verified counts (40 components, 88 unit tests, 155 browser checks across 3
  engines) stated as facts with a link to `/validation`, replacing vague ones.

### B3. Fix nav inconsistency

`/` renders nav `Overview · Components · Setup · For AI` with the tagline
"UI / REACT MATERIALS" and a "GITHUB COMING SOON" chip. `/components` renders
`Overview · Components · Docs · Validation` with "GLASS UI FOR REACT" and a
"RELEASE CANDIDATE" chip. Two different headers on one product site.
Unify on a single header component and one tagline.

### B4. Sharpen the stat strip

`40 / 18+ / DOM / CSS / MIT / 03` — "DOM · Native semantics" and "03 · Browser
engines" are cryptic. Rewrite so each cell reads as a claim, not a token.

### B5. Ship the missing web basics

Currently the landing 404s on `/favicon.ico` and has no share image.
Add: favicon (SVG + ICO, derived from the existing aperture wordmark), OG image
at 1200×630, `og:url` + canonical, `twitter:card: summary_large_image`,
`robots.txt`, `sitemap.xml`.

### B6. Component inventory becomes live

The `40 components. One predictable API.` section lists names as static text
pills. On a component library's landing page that is the single biggest missed
proof. Render a representative live subset inline (the components already exist
and are already interactive on `/components`), with the full catalog one click
away.

---

## Section C — Repository presentation

### C1. README is currently maintainer-facing

It opens with release posture and handover links. A visitor evaluating the
library in ten seconds needs: what it is, what it looks like, install, minimal
example, docs link. Rewrite in that order; move handover/context material to
`CONTRIBUTING.md` and the existing `context/` pack.

### C2. npm metadata is incomplete

No package declares `repository`, `homepage`, or `bugs`. npm renders these
prominently and provenance attestation needs `repository`. Add all three.

---

## Section D — GitHub and release automation

1. Create public `moekoelueker/open-glass-ui`; push all 15 commits of history.
2. Archive `moekoelueker/refract` with a README banner pointing at the new repo,
   preserving its research docs as a record.
3. Keep the existing `ci.yml` (quality gate).
4. Add `release.yml`: on tag, run the full gate then `changeset publish` with
   **npm provenance via OIDC** (`id-token: write`), so the package carries a
   verifiable link back to the commit that built it.
5. Add `CODEOWNERS`, PR template, and a `good first issue` label set so the
   repository is actually contributable.

### Blocked on the owner

- `gh auth refresh -h github.com -s workflow` — without the `workflow` scope the
  push is rejected wholesale when it includes `.github/workflows/`.
- An npm token that can publish a **new** package (classic Automation, or
  granular with *All packages* + read/write). The current token 403s on every
  account endpoint and is almost certainly scoped to `@namingsignal`.

Nothing is published until both are in place. Everything else proceeds.

---

## Section E — moelueker.com/liquid-glass

### Shape

A new Next.js route in the `(site)` group at `app/(site)/liquid-glass/page.tsx`,
inheriting the existing navbar/footer chrome.

It is **not** a byte-for-byte port of the Vite landing. It is a tightened
marketing page that reuses the strongest ~70% — hero, live material playground,
material anatomy, component proof, install, AI-agent section — and drops what
belongs to a standalone site (its own header, its own footer, the research
routes).

### Key property: it dogfoods the real package

The page imports from the published `open-glass-ui` package, not from local
source. Your own site becomes the first external consumer, which validates the
public API for real rather than by fixture.

### Server/client split

Page shell, copy, and metadata are server-rendered for SEO. Only the interactive
playground is a `"use client"` island.

### SEO

Title/description target "liquid glass ui react"; `metadata` export with OG
image; JSON-LD `SoftwareApplication`; canonical URL. This is the reason for
choosing a server-rendered port over proxying the SPA.

### Full showcase

Deploys as a separate Vercel project from the public repo
(`apps/showcase`), linked from `/liquid-glass` and the README. Keeps library
docs on the library's release cycle, not the personal site's.

### Inbound links

Footer, plus a card wherever projects are surfaced. Note `/tools` currently
holds consumer AI tools (headshots, music, thumbnail analyzer) — a developer
library does not belong there; `/products` or a direct nav entry fits better.

---

## Sequencing

1. Section A (packaging) — verified by `verify:packages`.
2. Sections B + C (landing, README, metadata) — verified by screenshots and e2e.
3. Full `release:check` including browser suite.
4. Section D — create repo, push. *(needs `workflow` scope)*
5. Publish to npm. *(needs a publish-capable token)*
6. Section E — moelueker.com page against the published package.

Steps 1–3 are unblocked and start now. Steps 4–6 wait on the two credentials.

## Out of scope

- Physical-device GPU / VoiceOver / NVDA testing (owner-performed, per the
  existing release checklist).
- Trademark clearance. The project continues to state it is independent and not
  affiliated with Apple Inc.
- The launch video and the long-form article.
