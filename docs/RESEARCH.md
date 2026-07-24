# Research Refresh

Research date: 2026-07-24

## Current platform findings

- MDN marks CSS `backdrop-filter` as Baseline 2024 and specifies both function
  and SVG URL syntax, while warning that not every standards-defined part is
  implemented uniformly.
- SVG `feDisplacementMap` remains the portable primitive for displacement of an
  owned/supplied source graphic.
- Chrome's HTML-in-Canvas API is an early origin trial in Chrome 148–150. It is
  useful future research, not a production dependency.
- WCAG 2.2 AA contrast targets remain 4.5:1 for normal text and 3:1 for large
  text, with non-text contrast applied to essential control boundaries/states.

## Current implementation references

| Project | Current role in this research | License |
| --- | --- | --- |
| `PallavAg/liquid-glass-web-react` | compact engine/React boundary and Safari handling | MIT |
| `samasante/liquid-glass` | supplied DOM plus WebGL media/shared-source benchmark | MIT |
| `iyinchao/liquid-glass-studio` | WebGL/WebGPU shader-quality benchmark | MIT |
| `rdev/liquid-glass-react` | adoption and Chromium visual benchmark | MIT |
| `shuding/liquid-glass` | historical SDF/map algorithm reference | MIT |

The clean-room implementation does not copy these source trees.

## Package snapshot

| Package | Version | React peer | Published unpacked size |
| --- | --- | --- | --- |
| `liquid-glass-react` | 1.1.1 | React 19+ | about 180 KB |
| `@samasante/liquid-glass` | 0.1.1 | React 18+ | about 418 KB |
| `liquid-glass-web-react` | 0.1.1 | React 18+ | about 189 KB |
| `react-magic-ui` | 1.0.9 | React is a runtime dependency | about 389 KB |
| `glass-refraction` | 0.1.0 | React 18+ | about 65 KB |

Package metadata is a volatile snapshot and will be refreshed before any public
comparison is published.

## Architecture consequence

No single project supplies all required qualities. Prism Lab therefore separates:

1. Deterministic framework-independent optics.
2. Explicit renderer backends.
3. Post-hydration React capability policy.
4. Accessible DOM-native recipes.
5. Browser-specific visual and performance evidence.

