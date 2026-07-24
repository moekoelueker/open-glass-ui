# Browser Support Policy

Research snapshot: 2026-07-24

## Target matrix

- Latest stable Chromium.
- Latest stable Firefox.
- Latest stable WebKit/Safari.
- Desktop and representative mobile viewports.

## Renderer policy

| Renderer | Intended role | Support claim |
| --- | --- | --- |
| CSS material | universal visual fallback | Broad modern-browser target |
| Organic SVG | expressive filter on owned content | Verified per-browser |
| SDF/SVG | supplied or duplicated DOM refraction | Verified per-browser |
| Live backdrop URL filter | optional enhancement | Never inferred from user agent |
| WebGL2 | controlled image/canvas/video sources | Capability detected after hydration |
| HTML-in-Canvas | research only | Chrome origin trial; not a v1 renderer |
| WebGPU | post-v1 research | Not required for the prototype winner |

`backdrop-filter` blur is a Baseline 2024 feature, but support for an SVG URL
filter in the backdrop chain must not be inferred from blur support.

## Adaptive states

- The server renders stable semantic content and an intentional CSS material.
- Client capability checks may upgrade the renderer after hydration.
- Reduced transparency selects a more opaque standard material.
- Reduced motion removes nonessential optical movement.
- Forced colors removes transparency/refraction and preserves system semantics.

## Evidence

| Validation | Chromium | Firefox | WebKit |
| --- | --- | --- | --- |
| Shared routes and controls | Pass | Pass | Pass |
| Automated axe scan on five routes | Pass | Pass | Pass |
| CSS material | Pass | Pass | Pass |
| Organic SVG | Pass | Pass | Pass |
| Deterministic SDF/SVG | Pass | Pass | Pass |
| WebGL2 controlled video | Ready | Ready in test host | Ready in test host |
| Unsupported WebGL2 fallback | Pass | Pass | Pass |
| Reduced motion | Pass | Pass | Pass |
| Emulated reduced transparency | Pass | Pass | Pass |
| Forced-colors emulation | Pass | Not exposed by Playwright | Not exposed by Playwright |
| Context loss/restoration | Pass | Not deterministic in harness | Not deterministic in harness |
| Desktop captures | 16 approved | 16 approved | 16 approved |
| Mobile captures | 11 approved | 11 approved | 11 approved |

Evidence lives under `artifacts/screenshots/pass-02/`. This matrix describes the
tested browser builds bundled with Playwright 1.61 on macOS; it is not a promise
that every older browser/GPU combination supports every enhanced path.

## Intentional differences

- Native slider thumbs and font rasterization vary by browser.
- CSS and SVG filter compositing differ subtly in luminosity and edge softness.
- WebGL2 is capability-detected after hydration and may remain on its source +
  CSS fallback on restricted GPUs, privacy modes, or software policies.
- `prefers-reduced-transparency` is not uniformly implemented, so the test
  harness also validates the same policy through an explicit media-query probe.

## Unsupported environments

The semantic DOM and opaque/CSS material should remain usable when SVG filters,
backdrop filtering, WebGL2, motion, or transparency are unavailable. The project
does not currently claim support for legacy browsers without ESM, React 18, or
modern CSS custom properties.
