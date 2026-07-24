# Experiment Report

Status: first validation pass complete; second-pass refinements in progress  
Evidence date: 2026-07-24  
Test host: macOS, Node 24.11, Playwright 1.61

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

## First-pass finding

The adaptive hybrid is the recommended v1 architecture. It does not win every
single visual category, but it is the only approach that can choose WebGL2 for
owned media, deterministic SVG/SDF for supplied DOM, layered CSS for arbitrary
DOM, and opaque semantic material for accessibility preferences without leaving
missing effects.

The strongest standalone optical result is WebGL2. The strongest expressive art
direction is Organic SVG. The strongest universal baseline is Layered CSS.

## Evidence-based observations

### 01 — Layered CSS

Text, controls, and focus remain exceptionally crisp, and the effect is
consistent across Chromium, Firefox, and WebKit. Its first-pass specimen was too
visually quiet because the photographic source did not read strongly enough
outside the glass.

Second-pass target: reveal the source more clearly and add explicit tint,
luminosity, and edge layers without suggesting physical refraction.

### 02 — Organic SVG

The contour field produces the most distinctive visual identity and remained
remarkably consistent in the three browser captures. The outer fluid field can
compete with nearby content when intensity is high.

Second-pass target: protect the content core, concentrate displacement at the
rim, and add a restrained caustic rather than increasing global noise.

### 03 — Geometric SDF

The deterministic map is live and stable, but its correctness is easier to
measure in code than to perceive in the initial composition. It needs visible
geometric evidence to communicate why it differs from CSS.

Second-pass target: add calibration fiducials, normal/thickness readouts, and a
more legible displaced measurement grid.

### 04 — WebGL2 optical

This route has the clearest true refraction: the large and small shader lenses
shift the controlled canvas coherently in all three browsers. Headless Chromium
initially rejected the context when `failIfMajorPerformanceCaveat` was set; the
renderer now permits a software context and lets the quality policy decide
whether the path is appropriate.

Second-pass target: make source ownership explicit, improve fallback telemetry,
and reduce the apparent competition between the DOM material and shader lenses.

### 05 — Adaptive hybrid

This route has the best total product posture and the strongest accessibility
story. Its first-pass art direction was too close to the SDF route because the
active capability policy was expressed only in small status text.

Second-pass target: make the policy branches visible, show the selected branch,
and distinguish production telemetry from optical calibration.

## Cross-cutting first-pass defects fixed

- Replaced invalid nested-button disclosure markup with an explicit accessible
  open/close lifecycle.
- Restored focus after menu selection and Escape.
- Fixed a light-page inherited color that made a dark instrument heading fail
  contrast.
- Moved matrix renderer labels away from the time readout.
- Allowed software WebGL2 contexts so CI can exercise the shader instead of
  producing a false-negative capability mismatch.
