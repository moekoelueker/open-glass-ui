# Experiment Report

- Status: archived renderer research; architecture decision incorporated into
  the OpenGlass UI release candidate
- Evidence date: 2026-07-24
- Test host: macOS, Node 24.11, Playwright 1.61

> The scores and evidence below describe the research passes completed on the
> evidence date. The resulting product policy is now fixed: `renderer="auto"`
> is CSS-first, SDF/SVG is explicit, and controlled-media WebGL is available
> only through the opt-in `open-glass-ui/webgl` entry.

## Equal-weight rubric

Each dimension is scored from 1–10. The total is normalized to 100.

| Approach | Realism | Aesthetic | Readability | Interaction | A11y | Browsers | Perf. | SSR | API | Maintain. | OSS | Pass 1 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Layered CSS | 5 | 8 | 10 | 9 | 10 | 10 | 10 | 10 | 9 | 10 | 10 | 92 |
| Organic SVG | 7 | 9 | 9 | 8 | 9 | 8 | 7 | 9 | 8 | 8 | 8 | 82 |
| Geometric SDF | 8 | 8 | 9 | 8 | 9 | 8 | 8 | 9 | 8 | 7 | 8 | 82 |
| WebGL2 optical | 10 | 9 | 9 | 9 | 9 | 8 | 7 | 8 | 8 | 7 | 7 | 83 |
| Adaptive hybrid | 8 | 9 | 10 | 9 | 10 | 10 | 8 | 10 | 9 | 8 | 9 | 91 |

Scores measure the route as a possible open-source foundation, not screenshot impact
alone. This is why CSS and hybrid rank above more optically dramatic techniques.

## Final second-pass score

| Approach | Realism | Aesthetic | Readability | Interaction | A11y | Browsers | Perf. | SSR | API | Maintain. | OSS | Final |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Layered CSS | 5 | 9 | 10 | 9 | 10 | 10 | 10 | 10 | 9 | 10 | 10 | **93** |
| Organic SVG | 8 | 10 | 9 | 9 | 9 | 8 | 7 | 9 | 8 | 8 | 8 | **85** |
| Geometric SDF | 9 | 9 | 9 | 9 | 9 | 8 | 8 | 10 | 9 | 8 | 9 | **88** |
| WebGL2 optical | 10 | 10 | 9 | 9 | 9 | 9 | 8 | 8 | 9 | 8 | 8 | **88** |
| Adaptive hybrid | 9 | 10 | 10 | 10 | 10 | 10 | 9 | 10 | 10 | 9 | 9 | **96** |

The score is the rounded equal-weight mean of all eleven dimensions. It is not
weighted to force the recommendation.

## Final recommendation

The **Adaptive Hybrid Engine** is the best v1 architecture. “Hybrid” means one
stable semantic API with bounded renderer choices and coherent fallbacks; it
does not mean that `auto` silently upgrades ordinary components to GPU or SVG
rendering:

- `auto` uses layered CSS for arbitrary DOM;
- deterministic SDF/SVG is an explicit enhancement for suitable owned or
  supplied DOM;
- `open-glass-ui/webgl` is an explicit controlled-media adapter for an owned
  image, canvas, or video; and
- forced colors or reduced transparency can select an opaque semantic material.

Use Layered CSS as the always-installed baseline. Keep SDF/SVG as the enhanced
DOM path. Ship WebGL2 as an advanced controlled-media adapter through the
separate public subpath so CSS/SVG consumers do not load it.
Keep Organic SVG as an explicit expressive filter recipe, never the automatic
material, because its cost and browser variation are less predictable.

WebGL2 remains the best pure optical result. Layered CSS remains the best
universal single renderer. Organic SVG remains the strongest expressive art
direction.

## Second-pass improvements

### 01 — Layered CSS

- Repaired the environment stacking model so the photographic source is visible
  behind the material.
- Added a visible three-layer legend for source, blur/tint, and edge light.
- Increased edge definition without implying directional refraction.

Result: the route now communicates why disciplined CSS can look premium while
remaining the most robust fallback.

### 02 — Organic SVG

- Protected a dark, quiet content core.
- Concentrated expression in the contour field and rim.
- Added restrained caustic rings and replaced synthetic canvas motion with an
  original H.264 video source.

Result: the strongest art direction now preserves text and control clarity.

### 03 — Geometric SDF

- Strengthened the displaced measurement grid.
- Added X/Y/normal fiducials so deterministic geometry is visually legible.
- Reduced source-noise dominance after cross-browser inspection.

Result: viewers can see the geometric premise instead of trusting an invisible
implementation detail.

### 04 — WebGL2 optical

- Made source ownership, lens count, and live texture state explicit.
- Fed the shader a real 960×540 video source.
- Added unsupported-path tests, video swaps, hidden-document transitions,
  repeated remounts, context loss/restoration, and cleanup verification.

Result: the best refraction is paired with an honest ownership and lifecycle
contract.

### 05 — Adaptive hybrid

- Added a live renderer policy rail for DOM, media, and accessibility branches.
- Exposed the available/recommended branch instead of hiding policy in small
  telemetry; the rail does not change the CSS-first `auto` contract.
- Verified low-concurrency quality, reduced motion, reduced transparency, forced
  colors, unsupported WebGL2, and route-state isolation.

Result: the winner now looks and behaves like a production system rather than a
restyled SDF demo.

## First-pass finding

The adaptive hybrid is the recommended v1 architecture. It does not win every
single visual category, but it is the only approach that can expose explicit
WebGL2 for owned media, explicit SVG/SDF for supplied DOM, CSS-first material
for arbitrary DOM, and opaque semantic material for accessibility preferences
without leaving missing effects.

The strongest standalone optical result is WebGL2. The strongest expressive art
direction is Organic SVG. The strongest universal baseline is Layered CSS.

## Evidence-based observations

### 01 — Layered CSS

Text, controls, and focus remain exceptionally crisp, and the effect is
consistent across Chromium, Firefox, and WebKit. Its first-pass specimen was too
visually quiet because the photographic source did not read strongly enough
outside the glass.

Implemented in pass 2.

### 02 — Organic SVG

The contour field produces the most distinctive visual identity and remained
remarkably consistent in the three browser captures. The outer fluid field can
compete with nearby content when intensity is high.

Implemented in pass 2.

### 03 — Geometric SDF

The deterministic map is live and stable, but its correctness is easier to
measure in code than to perceive in the initial composition. It needs visible
geometric evidence to communicate why it differs from CSS.

Implemented in pass 2.

### 04 — WebGL2 optical

This route has the clearest true refraction: the large and small shader lenses
shift the controlled canvas coherently in all three browsers. Headless Chromium
initially rejected the context when `failIfMajorPerformanceCaveat` was set; the
renderer now permits a software context and lets the quality policy decide
whether the path is appropriate.

Implemented in pass 2.

### 05 — Adaptive hybrid

This route has the best total product posture and the strongest accessibility
story. Its first-pass art direction was too close to the SDF route because the
active capability policy was expressed only in small status text.

Implemented in pass 2.

## Cross-cutting first-pass defects fixed

- Replaced invalid nested-button disclosure markup with an explicit accessible
  open/close lifecycle.
- Restored focus after menu selection and Escape.
- Fixed a light-page inherited color that made a dark instrument heading fail
  contrast.
- Moved matrix renderer labels away from the time readout.
- Allowed software WebGL2 contexts so CI can exercise the shader instead of
  producing a false-negative capability mismatch.

## Second-pass defects fixed

- Corrected an environment positioning collision that collapsed the instrument
  source layer.
- Replaced the procedural canvas with a real generated video source and explicit
  pause/cleanup behavior.
- Reset experiment-local lab state on internal route changes so video, material,
  and quality state cannot leak between engines.
- Retained observable WebGL context-loss/restoration states.
- Added package archive, install, export, peer-dependency, and tree-shaking
  verification.
