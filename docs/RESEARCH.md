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

## Requested source audit

| Source | Useful finding | Decision |
| --- | --- | --- |
| [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | material is functional hierarchy, not decoration; adapt for contrast and accessibility | adopted as design principle, no assets/code |
| [Aave — Building Glass for the Web](https://aave.com/design/building-glass-for-the-web) | displacement maps, supplied sources, resize discipline, and Safari constraints | informed renderer boundaries |
| [UI Layouts — Liquid Glass](https://www.ui-layouts.com/components/liquid-glass) | compact copy/paste demo and immediate visual controls | treated as an adoption benchmark, not a foundation |
| [Plain English — React Magic UI](https://javascript.plainenglish.io/react-magic-ui-e4289a3a0e8b) | broad component-library presentation and demo discoverability | informed showcase breadth only |
| [Callstack — Liquid Glass in React Native](https://www.callstack.com/blog/how-to-use-liquid-glass-in-react-native) | native platform effects need capability/version boundaries and fallbacks | conceptual portability evidence; no React Native code used |
| [Cygnis — Liquid Glass UI in React Native](https://cygnis.co/blog/implementing-liquid-glass-ui-react-native/) | layering, blur, gradients, and motion can approximate the visual language | web implementation remains first-principles and DOM-native |
| [Dribbble liquid-glass search](https://dribbble.com/search/liquid-glass) | broad visual trend scan | used only to identify clichés to avoid |

The React Native sources are informative about material semantics but do not
solve browser source sampling, SSR, SVG, or WebGL lifecycle. The Dribbble scan
was not treated as engineering evidence.

## Primary implementation sources

- [React `useEffect`](https://react.dev/reference/react/useEffect) informed
  external-system lifecycle and cleanup boundaries.
- [MDN `backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
  informed the CSS baseline and its support wording.
- [MDN `feDisplacementMap`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap)
  informed portable SVG channel displacement.
- [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
  informed bounded DPR, resource reuse, and explicit teardown.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the accessibility standard
  behind the contrast and semantic requirements.

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

No single project supplies all required qualities. OpenGlass UI therefore separates:

1. Deterministic framework-independent optics.
2. Explicit renderer backends.
3. Post-hydration React capability policy.
4. Accessible DOM-native recipes.
5. Browser-specific visual and performance evidence.
