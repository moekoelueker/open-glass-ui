# Architecture

Status: review-ready research architecture  
Evidence date: 2026-07-24

## Recommendation

The v1 foundation should be the adaptive hybrid, with a deliberately small
default:

1. Layered CSS is the universal DOM material and safety net.
2. Deterministic SDF/SVG is an opt-in enhancement for owned or supplied DOM.
3. WebGL2 is an opt-in controlled-media renderer for image, canvas, and video.
4. Organic turbulence stays an expressive recipe, not the default engine.
5. Accessibility preferences can always force an opaque semantic material.

This is one capability policy with several bounded renderers, not one
“physically accurate” effect stretched beyond browser reality.

## Package boundaries

```text
@prism-lab/recipes ──────► @prism-lab/react
                                  │
                                  ▼
@prism-lab/core ◄──────── @prism-lab/renderers
        ▲                         ▲
        └─────────────────────────┘
```

| Package | Owns | Must not own |
| --- | --- | --- |
| `core` | SDFs, normals, material values, maps, quality, cache | React, DOM, browser globals |
| `renderers` | Capability policy, CSS tokens, SVG encoding, WebGL2 renderer | Component behavior |
| `react` | Hydration-safe policy, primitives, filter and media lifecycles | Recipe styling or per-frame React state |
| `recipes` | Accessible component behavior and optional CSS | Optical math or renderer selection |

The optics core has zero runtime dependencies. React and React DOM are peer
dependencies of the React-facing packages. Each package is ESM, has declaration
output, and is independently packable.

## Runtime decision policy

Renderer selection is source-aware and capability-driven:

| State | DOM source | Controlled media |
| --- | --- | --- |
| Forced colors or reduced transparency | opaque CSS | opaque CSS |
| Supported enhanced path | SDF/SVG | WebGL2 |
| Unsupported or pre-hydration | layered CSS | source media + CSS controls |

The server never guesses browser support. It emits stable semantic content with
the CSS baseline, then the provider detects individual capabilities after
hydration. Support for backdrop blur, SVG filter elements, backdrop URL syntax,
and WebGL2 is recorded separately.

## Optical model

The deterministic path evaluates a signed-distance function for circle,
capsule, rounded rectangle, or superellipse geometry. Finite differences
produce unit normals; the distance field produces a thickness profile and edge
response. The resulting RGBA map stores displacement channels, specular
response, and mask.

The WebGL2 path uses the same optical vocabulary—shape distance, surface normal,
thickness, index of refraction, dispersion, frost, and edge strength—but applies
it directly to an owned texture. Up to six lenses share a source and draw call.
This is physics-inspired and coherent; it is not a spectral path tracer.

## React surface

The intended initial API remains semantic:

```tsx
<GlassProvider quality="auto" motion="system">
  <Glass material="regular" source="dom" interactive>
    <Toolbar label="Editing tools">…</Toolbar>
  </Glass>
</GlassProvider>
```

Advanced paths remain explicit:

```tsx
<GlassGroup id="workspace-source">
  <GlassSource>{content}</GlassSource>
  <Glass filterId={filter.filterId} geometry={geometry}>
    {content}
  </Glass>
</GlassGroup>
```

```tsx
<WebGLGlassSurface
  sourceRef={videoRef}
  lenses={lenses}
  continuous
  maxDevicePixelRatio={2}
/>
```

Recommended v1 public surface:

- `GlassProvider`
- `Glass`
- `GlassGroup` and `GlassSource`
- semantic material presets: `clear`, `regular`, `frosted`
- `useSdfFilter`, `SdfFilterDefinition`, and `OrganicFilterDefinition`
- `WebGLGlassSurface` as an advanced controlled-media primitive
- framework-independent geometry, map, cache, and policy functions

Recipe components should remain in a separate optional package. Experimental
shader internals, raw filter graphs, and showcase-only annotations should not be
promoted to public API.

## Performance and lifecycle

- Pointer response writes CSS custom properties from animation frames rather
  than setting React state per frame.
- Position-only movement never regenerates displacement maps.
- Map generation has low, medium, and high profiles plus an 8 MiB bounded LRU
  cache.
- Video rendering uses `requestVideoFrameCallback` when available.
- Hidden documents stop drawing.
- Resize observers, animation frames, video-frame callbacks, media, event
  listeners, WebGL objects, and context handlers are released on unmount.
- Route identity remounts each experiment, preventing one engine’s state or
  media source from leaking into another.

## Accessibility contract

Semantics and interaction remain native DOM above optical layers. The material
must never be the only carrier of state. Reduced motion freezes decorative
animation and media. Reduced transparency and forced colors select the
accessibility fallback. Contrast is judged on the actual hostile-background
matrix, not a neutral mockup.

Automated checks support this contract but do not replace human screen-reader,
zoom, and real-device review before a public release.

## Release boundary

The architecture is ready for API review, not npm publication. Before release:

- approve a public name and package namespace;
- freeze the supported API and version policy;
- test representative physical iOS, Android, macOS, and Windows devices;
- complete VoiceOver, NVDA, and high-zoom review;
- decide whether WebGL2 ships in the main React package or an optional subpath;
- replace internal version `0.0.0` and remove `private` only with explicit
  publication approval.
