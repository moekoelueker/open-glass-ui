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

The final matrix will link browser-specific Playwright captures and document
intentional renderer differences.

