# Research Summary

Research dates: 2026-07-24 through 2026-07-25  
Detailed sources: [`../docs/RESEARCH.md`](../docs/RESEARCH.md)  
Full experiment record:
[`../docs/EXPERIMENT-REPORT.md`](../docs/EXPERIMENT-REPORT.md)

## Research question

What architecture can deliver a premium Liquid Glass visual language for React
and the web while remaining reusable, accessible, understandable, performant,
SSR-safe, and easy for humans or AI agents to integrate?

## Sources reviewed

### Requested design and implementation references

- Apple Human Interface Guidelines — Materials.
- Aave — Building Glass for the Web.
- UI Layouts — Liquid Glass.
- Plain English — React Magic UI.
- Callstack — Liquid Glass in React Native.
- Cygnis — Liquid Glass UI in React Native.
- Dribbble Liquid Glass visual search.

### Official technical references

- React lifecycle and effect guidance.
- MDN `backdrop-filter`.
- MDN SVG `feDisplacementMap`.
- MDN WebGL best practices.
- W3C WCAG 2.2.

### Open-source implementation benchmarks

- `PallavAg/liquid-glass-web-react`
- `samasante/liquid-glass`
- `iyinchao/liquid-glass-studio`
- `rdev/liquid-glass-react`
- `shuding/liquid-glass`

These projects were evaluated as prior art, adoption benchmarks, or technical
references. The OpenGlass UI implementation remained clean-room and did not
copy their source trees.

## Main findings

### Material is functional hierarchy

The strongest design guidance treats material as a way to establish depth,
focus, containment, and context. Repeating heavy glass on every content surface
makes interfaces noisy and weakens hierarchy.

Product consequence:

- Use glass selectively for navigation, controls, overlays, and important
  surfaces.
- Keep content clarity and state communication independent from transparency.

### CSS is the only universal arbitrary-DOM baseline

CSS backdrop blur, tint, borders, inset highlights, shadows, and pseudo-element
caustics are inspectable, themeable, SSR-friendly, and broadly resilient.

Limit:

- CSS can imply optical depth but does not perform true source refraction.

Product consequence:

- CSS is the default and fallback.
- Marketing copy must not call the CSS path physically accurate refraction.

### SVG displacement is useful but source- and browser-sensitive

SVG displacement can provide genuine deterministic channel displacement for a
supplied source. SDF-generated maps make shape behavior coherent and testable.

Limits:

- Backdrop URL behavior, caching, filter bounds, and source sizing vary by
  browser.
- Authoring and debugging are more technical than CSS.

Product consequence:

- SVG/SDF remains explicit rather than automatic.
- Conservative bounds, stable IDs, encoded maps, and fallbacks are required.

### WebGL provides the highest optical ceiling for owned media

A shader can sample an image, canvas, or video, calculate thickness and normals,
and apply coherent refraction, dispersion, frost, edge response, and
Fresnel-like highlights.

Limits:

- It cannot generally sample arbitrary live page pixels.
- It has GPU, lifecycle, context-loss, DPR, and source-ownership costs.
- Text and controls rendered into canvas would lose native semantics.

Product consequence:

- WebGL is opt-in through `open-glass-ui/webgl`.
- It is reserved for controlled, owned media and high-value surfaces.
- Original media and DOM controls remain available as fallback.

### “Hybrid” must describe policy, not silent escalation

An adaptive system can expose multiple bounded renderers behind one semantic
vocabulary. It should not automatically select the most visually expensive
path just because a browser supports it.

Product consequence:

- `renderer="auto"` is CSS-first.
- Enhanced paths require explicit intent.
- Accessibility preferences can force the opaque semantic material.

### Physics-inspired is more honest than physically accurate

Signed-distance geometry, finite-difference normals, thickness fields, index of
refraction, dispersion, frost, and edge response produce coherent behavior.
They do not constitute a full spectral path tracer or native system renderer.

Product consequence:

- Use optical language precisely.
- Explain the mapping from geometry to thickness and refraction.
- Avoid overclaiming.

### React Native references are conceptual, not directly portable

Native blur/material APIs confirm the value of capability/version boundaries,
layering, motion, and fallbacks. They do not solve browser source sampling, SVG
behavior, WebGL lifecycle, SSR, or DOM semantics.

Product consequence:

- React/web remains the current focus.
- A future native adapter should be treated as a separate platform project.

### Visual trend research identified clichés to avoid

Common Liquid Glass concepts overuse perfect spheres, cyan/purple gradients,
excessive blur, low-contrast text, and disconnected floating cards.

Product consequence:

- Prefer neutral materials, formed irregular shapes, clear type, restrained
  color separation, and realistic product compositions.

## Five-engine experiment

Each approach was built against shared interactions and difficult backgrounds:

| Engine | Strength | Limitation | Final role |
| --- | --- | --- | --- |
| Layered CSS | Reliability, performance, semantics | Implied rather than true refraction | Default/fallback |
| Organic SVG | Strong personality and irregular contours | Variation and noise in dense UI | Expressive recipe |
| Geometric SDF | Deterministic geometry and maps | Technical authoring, moderate visual payoff | Explicit DOM enhancement |
| WebGL2 | Strongest controlled-media refraction | GPU/source/lifecycle cost | Opt-in hero specialist |
| Adaptive Hybrid | Best total product posture | More policy and documentation to maintain | Overall architecture |

Second-pass equal-weight scores were CSS 93, Organic SVG 85, Geometric SDF 88,
WebGL2 88, and Adaptive Hybrid 96.

The later product-weighted ranking gave visual appeal 50% and selected:

1. Adaptive Hybrid — 9.36.
2. Native CSS — 9.25.
3. Spectral WebGL — 8.66.

Both rubrics point to the same architecture even though they evaluate different
questions.

## Naming research

Hundreds of candidates were generated and evaluated with category relevance,
pronunciation, strategic fit, domain posture, and namespace signals. The owner
selected **OpenGlass UI** because it immediately communicates open-source glass
UI while remaining broad enough for components, themes, tokens, SVG, WebGL, and
future adapters.

The descriptive phrase “Liquid Glass UI” remains in the tagline and metadata
for discovery. The primary brand avoids presenting the project as an Apple
implementation.

Availability checks were preliminary and time-bound. They are not reservations
or legal clearance. See
[`../docs/NAMING-RESEARCH.md`](../docs/NAMING-RESEARCH.md).

## Research conclusions that should not be reopened casually

- CSS-first `auto`.
- WebGL only through explicit opt-in and owned media.
- DOM-native text and controls.
- Neutral adaptive themes with optional accents.
- One public facade with internal package boundaries.
- Adaptive Hybrid as the architecture, not a visual theme name for consumers.
- No physical-accuracy or Apple-affiliation claims.

Revisit these only when the owner explicitly changes product direction or new
platform evidence materially changes a premise.

## Facts that must be refreshed before external claims

- Package, repository, domain, and trademark availability.
- Competing package versions and sizes.
- Browser support details.
- Device/GPU performance.
- Accessibility behavior on current physical assistive technology.
- Registry installation and public URLs.
