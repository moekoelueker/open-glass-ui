# Decision Log

This file records settled product and architecture decisions. Detailed
implementation behavior remains canonical in source and topic documentation.

## D-001 — Build clean-room from first principles

**Decision:** Research prior art, but implement independently.

**Why:** The goal was a coherent reusable system rather than a fork of one
effect. Clean-room implementation simplifies licensing, avoids inherited
constraints, and lets the architecture follow the product requirements.

**Consequence:** Credit relevant prior art and standards, but do not copy source
trees or imply endorsement.

## D-002 — Use the OpenGlass UI identity

**Decision:** Display name `OpenGlass UI`, intended facade/repository slug
`open-glass-ui`, internal namespace `@open-glass-ui/*`, runtime prefix `ogui`.

**Why:** It is discoverable, understandable to developers and AI agents, and
broad enough for a full design system.

**Consequence:** Keep “Liquid Glass UI” in descriptive/search copy rather than
as the primary brand. Recheck legal and namespace posture before launch.

## D-003 — Target React and the web first

**Decision:** React 18+ peer support, TypeScript, ESM, DOM-native behavior.

**Why:** The original goal prioritized React and web-native website
experiences. React Native research was useful conceptually but does not solve
the browser problem.

**Consequence:** Do not introduce React Native or another framework into v1
without a separately scoped adapter plan.

## D-004 — Expose one public facade

**Decision:** Normal consumers import from `open-glass-ui`; advanced pure and
GPU behavior use `open-glass-ui/core` and `open-glass-ui/webgl`.

**Why:** A single predictable package is easier to adopt, document, version, and
use with AI agents.

**Consequence:** Internal `@open-glass-ui/*` imports belong only inside the
workspace and its dependency chain.

## D-005 — Use bounded package ownership

**Decision:**

- `core`: geometry, optics, maps, quality, cache, theme math.
- `renderers`: capability policy and CSS/SVG/WebGL implementations.
- `react`: providers, primitives, lifecycle, pointer/media integration.
- `recipes`: forty accessible component recipes and CSS.
- `ui`: public facade.

**Why:** Optical math, browser capability, React lifecycle, and component
semantics have different test and runtime constraints.

**Consequence:** Keep browser globals out of `core`, recipe behavior out of
renderers, and shader internals out of the root facade.

## D-006 — Adaptive Hybrid is the architecture

**Decision:** One semantic API with bounded CSS, SVG/SDF, and WebGL renderers.

**Why:** It best balances beauty, flexibility, integration, performance,
fallbacks, SSR, and accessibility.

**Consequence:** “Hybrid” is an internal/product architecture concept, not an
instruction to combine every engine on every surface.

## D-007 — `renderer="auto"` is CSS-first

**Decision:** Automatic selection resolves to the layered CSS path.

**Why:** CSS works with arbitrary DOM, preserves semantics, has the lowest
integration cost, and remains the most resilient baseline.

**Consequence:** Never change `auto` to silently select SVG or WebGL based only
on capability detection.

## D-008 — WebGL is explicit and source-owned

**Decision:** WebGL is imported from `open-glass-ui/webgl` and samples only an
owned image, canvas, or video.

**Why:** It provides the highest optical quality but has GPU, lifecycle, source,
and fallback constraints.

**Consequence:** CSS-only consumers must have zero eager WebGL inputs. Text and
controls remain DOM overlays.

## D-009 — SVG/SDF is an explicit deterministic enhancement

**Decision:** SDF-generated displacement maps support circle, capsule,
rounded-rectangle, and superellipse geometry.

**Why:** They provide testable normals, thickness, and displacement without
requiring a GPU canvas.

**Consequence:** Use conservative filter bounds, stable IDs, caching, and an
intentional CSS fallback.

## D-010 — Keep semantics above optics

**Decision:** All forty recipes use native DOM semantics; material never carries
state alone.

**Why:** Keyboard behavior, focus, selection, accessible names, forms, SSR, and
AI-generated integration are more reliable when the semantic layer is real.

**Consequence:** Do not replace controls or text with canvas-rendered
approximations.

## D-011 — Neutral adaptive theming is the default

**Decision:** High-contrast neutral light/dark themes, six optional accent
presets, and custom accent/secondary/tertiary colors.

**Why:** The earlier green accent was too opinionated. Neutral defaults compose
with more brands and keep the glass material itself central.

**Consequence:** Custom colors must still resolve readable foregrounds and
semantic status colors.

## D-012 — Use three semantic materials

**Decision:** `clear`, `regular`, and `frosted`.

**Why:** They give consumers a small, understandable vocabulary for optical
intensity and legibility.

**Consequence:** Add new materials only when they represent a durable semantic
job, not a one-off visual preset.

## D-013 — Ship forty complete components

**Decision:** Build a broad set covering controls, navigation, data display,
forms, feedback, overlays, and media.

**Why:** A serious design system needs enough coverage for a product, not only
buttons and cards.

**Consequence:** Preserve controlled/uncontrolled API patterns, native props,
labels, focus management, and shared tokens across every recipe.

## D-014 — Separate product marketing from renderer research

**Decision:** `/` is the single-product landing; `/components` is the canonical
catalog; `/research` and `/library` retain the comparison evidence.

**Why:** A prospective user should understand one product instead of choosing
between internal engines. The research remains valuable proof and educational
content.

**Consequence:** Do not restore engine-comparison framing to the main landing
page.

## D-015 — Preserve irregular formed geometry

**Decision:** Use slightly asymmetric morphing blobs, lenses, and apertures in
selected visual moments.

**Why:** The owner explicitly preferred formed/off-shape geometry over perfect
spheres and generic rounded cards.

**Consequence:** Keep motion restrained around dense controls and honor reduced
motion.

## D-016 — Favor coherent reflections over decorative streaks

**Decision:** Highlights should read as broad volumetric caustics or contained
glints that follow the material.

**Why:** A diagonal strip reads as a graphic overlay rather than three-
dimensional light.

**Consequence:** Radius-match inner contours, feather reflections, and visually
inspect the result on real backgrounds.

## D-017 — Make interactions authoritative and demonstrable

**Decision:** Playground controls, contours, distortion, product scenarios,
copy actions, overlays, and theme tools must visibly change real state.

**Why:** The showcase is evidence of a usable library, not a static concept
page.

**Consequence:** Add state assertions and visual review whenever a demonstration
control changes.

## D-018 — Treat accessibility modes as designed states

**Decision:** Reduced motion, reduced transparency, forced colors, opaque
fallbacks, keyboard focus, and contrast are first-class.

**Why:** Optical effects are optional; usable interaction is not.

**Consequence:** Rich hover styles must not override preference-specific
fallbacks. Automated Axe checks supplement, not replace, manual AT review.

## D-019 — Isolate high-frequency motion from React rendering

**Decision:** Use refs, CSS custom properties, animation frames, video-frame
callbacks, and bounded observers for transient motion.

**Why:** Per-frame React state would increase rendering cost and make lifecycle
cleanup harder.

**Consequence:** Position-only movement must not regenerate displacement maps.

## D-020 — Optimize validation for deterministic visual systems

**Decision:** Unit, SSR, package, browser, accessibility, performance, and
visual inspection are all required. The default browser suite uses one worker
with bounded retries.

**Why:** Running many backdrop/WebGL pages concurrently can oversubscribe local
GPU/compositor resources and create non-product timeouts.

**Consequence:** Keep functional tests stable by disabling unrelated entrance
motion where appropriate; keep real animation coverage in visual tests.

## D-021 — Keep publication as an explicit owner action

**Decision:** Local readiness does not authorize a remote, deployment, domain,
or npm publication.

**Why:** External actions involve namespace, legal, provenance, credential, and
release decisions.

**Consequence:** Stop and request authorization before any external release
mutation.

## D-022 — Ship the liquid design as the default, keep classic one prop away

**Decision:** 0.4 introduces `design="liquid"` as the default visual language
and preserves the 0.3 look as `design="classic"`. The liquid layer is a
separate stylesheet (`liquid.source.css`, generated to `liquid.css`) appended
after the classic recipes, scoped to `[data-ogui-design="liquid"]` with a
zero-specificity nearest-scope guard.

**Why:** The 0.3 materials read as dark, frosted panels rather than current
platform glass (clear, saturated, lit by a directional rim, capsule controls,
fluid selection). Existing consumers must be able to upgrade without a forced
redesign.

**Consequence:** Liquid rules must keep the exact specificity of the classic
rule they replace, and every liquid rule must be authored in
`liquid.source.css` and regenerated with `pnpm generate:liquid`; a unit test
fails when the generated file is stale. Classic output of
`createCssMaterialTokens` must not change.

## D-023 — A forced tone scopes the palette, and accent ink is chosen against the rendered fill

**Decision:** `<Glass tone>` that differs from the surrounding appearance writes
that tone's `--ogui-color-*` tokens, `data-ogui-appearance` and `color-scheme`
on its element and provides a nested theme context, so its text, nested
`Glass` surfaces and recipes all resolve against the nearest tone. Menus and
popovers with a forced `tone` use the same palette (`resolveToneTheme`). The
theme chooses accent ink and the liquid highlight mix together: the first of
`#101214`, `#f9f8f3`, `#000000`, `#ffffff` that keeps the full 16% highlight,
otherwise the ink that keeps the most, so text reaches 4.5:1 on every stop of
the liquid accent fill. The liquid primary fill is opaque, and the pointer
glint on accent fills stays inside a 0.4rem band at the top edge.

**Why:** A dark surface over a photo in a light app (the documented use of
`tone`) rendered dark text on dark glass. Light presets (cobalt, teal, violet,
coral, amber) and mid-tone custom accents fell below 4.5:1 on the lightened
highlight; with a translucent bottom stop no ink could pass for mid-tones.

**Consequence:** Same-tone and `tone="auto"` output is byte-identical. Some
light presets render `#ffffff` ink instead of `#f9f8f3`, and their highlight is
lighter than 16%. Classic receives only the corrected ink; its 0.3 rendering is
otherwise unchanged (D-022). Theme tokens must be read where they are used:
a variable that copies `--ogui-color-*` on an ancestor freezes that ancestor's
palette (the showcase had to change for this).

## D-024 — The Glass material stays inline

**Decision:** `Glass` keeps writing `background`, `border-color`, `box-shadow`,
`color` and `backdrop-filter` as inline style. Consumers restyle the material
with `look`, the `--ogui-glass-*` tokens or the `style` prop; utilities restyle
shape and spacing.

**Why:** Painting the material from a zero-specificity stylesheet rule was
implemented and measured. A computed-style diff of the showcase showed CSS that
inline styles had silently overridden (for example `border: 1px solid`, extra
shadows) taking effect and visibly changing surfaces. Consumer apps very likely
contain the same dormant rules, so the change cannot ship in a minor release.

**Consequence:** Tailwind `bg-*` utilities do not change a `Glass` background;
the README, THEMING and llms references say so. Revisit only with a major
version and a migration note.

## D-025 — One layer stack for overlays and disclosures

**Decision:** Dialogs, drawers, menus, popovers and tooltips register in one
stack (`packages/recipes/src/layers.ts`). Each portal host is positioned with a
stack-derived `z-index`, so the most recently opened layer paints on top.
Layers record the layer that owns their trigger; with a modal active, every
layer outside its owner tree is inert and capped below it. Document Escape
handlers act only for the top reachable layer and only on unconsumed events.
The toast viewport sits outside the stack, above it, and is never made inert.

**Why:** Fixed z-indexes put a menu opened inside a dialog under the dialog,
one Escape closed several layers, and a dialog opened from a popover left the
popover interactive above it.

**Consequence:** New layered recipes must register with the stack instead of
choosing a `z-index`. Paint order and hit testing are verified in a real
browser; jsdom covers the stack logic only.
