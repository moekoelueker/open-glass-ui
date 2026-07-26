# Architecture

- Status: release-candidate architecture; not published
- Decision date: 2026-07-25

## Recommendation

The v1 foundation is the adaptive hybrid, with a deliberately small default:

1. Layered CSS is the universal DOM material, the `auto` result, and the safety
   net.
2. Deterministic SDF/SVG is an opt-in enhancement for owned or supplied DOM.
3. WebGL2 is an opt-in controlled-media renderer for image, canvas, and video.
4. Organic turbulence stays an expressive recipe, not the default engine.
5. Accessibility preferences can always force an opaque semantic material.

This is one capability policy with several bounded renderers, not one
“physically accurate” effect stretched beyond browser reality.

## Package boundaries

```text
open-glass-ui
├── . ─────────► React primitives + forty recipes + shared utilities
├── /core ─────► server-safe, framework-independent utilities
└── /webgl ────► explicit controlled-media WebGL entry

@open-glass-ui/recipes ──────► @open-glass-ui/react
                                  │
                                  ▼
@open-glass-ui/core ◄──────── @open-glass-ui/renderers
        ▲                         ▲
        └─────────────────────────┘
```

| Package | Owns | Must not own |
| --- | --- | --- |
| `core` | SDFs, normals, material values, maps, quality, cache | React, DOM, browser globals |
| `renderers` | Capability policy, CSS tokens, SVG encoding, WebGL2 renderer | Component behavior |
| `react` | Hydration-safe policy, primitives, filter and media lifecycles | Recipe styling or per-frame React state |
| `recipes` | Accessible component behavior and recipe CSS | Optical math or renderer selection |

The optics core has zero runtime dependencies. React and React DOM are peer
dependencies of the React-facing packages. Each package is ESM, has declaration
output, and is independently packable. The public release-candidate facade is
`open-glass-ui@0.1.0-rc.0`; the `@open-glass-ui/*` packages are its
implementation dependency chain, not normal consumer entry points.

## Runtime decision policy

`renderer="auto"` is intentionally CSS-first. It does not promote a surface to
SVG or WebGL simply because the browser supports those technologies. Enhanced
renderers require an explicit consumer choice and a source they can legally and
technically sample:

| Request | Supported result | Unsupported or accessibility fallback |
| --- | --- | --- |
| `auto` or `css` over arbitrary DOM | layered CSS | opaque semantic CSS |
| explicit `organic-svg` or `sdf-svg` | requested SVG filter | layered or opaque CSS |
| `open-glass-ui/webgl` over owned media | WebGL2 surface | original media + DOM controls |

The server never guesses browser support. It emits stable semantic content with
the CSS baseline, then the provider detects individual capabilities after
hydration. Support for backdrop blur, SVG filter elements, backdrop URL syntax,
and WebGL2 is recorded separately. Forced colors or reduced transparency can
override any visual branch with an opaque semantic material.

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

The consumer API remains semantic:

```tsx
<GlassSystemProvider
  renderer="auto"
  quality="auto"
  motion="system"
  theme={{ appearance: "system", theme: { preset: "neutral" } }}
>
  <Glass material="regular" source="dom" interactive>
    <Toolbar label="Editing tools">…</Toolbar>
  </Glass>
</GlassSystemProvider>
```

Advanced paths remain explicit:

```tsx
<GlassGroup id="workspace-source">
  <GlassSource>{content}</GlassSource>
  <Glass
    renderer="sdf-svg"
    filterId={filter.filterId}
    geometry={geometry}
  >
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

Release-candidate public surface:

- the single `open-glass-ui` consumer facade;
- `GlassSystemProvider`, combining runtime, theme, and toast boundaries;
- `GlassProvider`;
- `Glass`;
- `GlassGroup` and `GlassSource`;
- semantic material presets: `clear`, `regular`, `frosted`;
- `useSdfFilter`, `SdfFilterDefinition`, and `OrganicFilterDefinition`;
- forty native-DOM recipe components and their shared stylesheet;
- framework-independent geometry, map, cache, policy, and theme functions from
  the server-safe `open-glass-ui/core` subpath;
- `WebGLGlassSurface` from the explicit `open-glass-ui/webgl` subpath.

Recipe components are included in the public facade. Experimental shader
internals, raw filter graphs, internal package boundaries, and showcase-only
annotations are not public API.

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

The owner has approved the OpenGlass UI identity and the local package
architecture. All five package manifests are prepared at `0.1.0-rc.0`, but
nothing has been published and no public remote has been created. Before
release:

- recheck and reserve the npm and repository namespaces;
- complete the release-candidate API and semver review;
- test representative physical iOS, Android, macOS, and Windows devices;
- complete VoiceOver, NVDA, and high-zoom review;
- run the release checklist against clean packed consumers and final
  screenshots; and
- obtain explicit owner authorization before creating a remote, deploying, or
  publishing.
