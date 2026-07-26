# Renderer Guide

OpenGlass UI is CSS-first. `renderer="auto"` intentionally chooses the layered
CSS material for arbitrary DOM; it does not select the most expensive renderer
available. SVG/SDF refraction is explicit, and WebGL2 is an opt-in subpath for
controlled image, canvas, or video sources.

## Decision table

| Path                  | Intended source                            | Selection                                  | Fallback                        |
| --------------------- | ------------------------------------------ | ------------------------------------------ | ------------------------------- |
| Layered CSS           | Arbitrary DOM                              | Default `auto` policy                      | More opaque or system-color CSS |
| Organic SVG           | Owned expressive DOM moment                | Explicit `organic-svg` + filter definition | CSS                             |
| Deterministic SDF/SVG | Owned or supplied DOM with stable geometry | Explicit `sdf-svg` + generated filter      | CSS                             |
| WebGL2                | Controlled image, canvas, or video         | Import from `open-glass-ui/webgl`          | Original media + CSS controls   |

Forced colors or detected reduced transparency always wins over a requested
enhanced renderer and selects the accessibility-safe CSS path. Unsupported
explicit renderers also resolve to CSS.

## Default CSS material

```tsx
import { Glass, GlassProvider, GlassThemeProvider } from "open-glass-ui";

export function Surface({ children }: { children: React.ReactNode }) {
  return (
    <GlassProvider renderer="auto" quality="auto" motion="system">
      <GlassThemeProvider appearance="system">
        <Glass material="regular" tone="auto" interactive>
          {children}
        </Glass>
      </GlassThemeProvider>
    </GlassProvider>
  );
}
```

`clear`, `regular`, and `frosted` are semantic material presets. The CSS path
uses blur, tint, border, shadow, and contrast tokens; it does not claim to
refract page pixels.

## Explicit SDF/SVG refraction

`useSdfFilter` creates deterministic displacement data for a stable geometry.
The browser canvas encoding happens after mount, so the initial server and
hydration output remains the CSS baseline.

```tsx
import { Glass, SdfFilterDefinition, useSdfFilter } from "open-glass-ui";

const geometry = {
  kind: "rounded-rect",
  width: 320,
  height: 160,
  cornerRadius: 28,
} as const;

export function RefractedPanel({ children }: { children: React.ReactNode }) {
  const filter = useSdfFilter({
    id: "account-panel",
    width: 320,
    height: 160,
    geometry,
    quality: "medium",
  });

  return (
    <>
      <SdfFilterDefinition filter={filter} />
      <Glass
        renderer="sdf-svg"
        filterId={filter.filterId}
        geometry={geometry}
        material="regular"
      >
        {children}
      </Glass>
    </>
  );
}
```

The supported SDF shapes are `circle`, `capsule`, `rounded-rect`, and
`superellipse`. Regenerate a map when size, geometry, material, or quality
changes—not when a lens merely moves.

For an expressive effect, define an organic filter and request it explicitly:

```tsx
import { Glass, OrganicFilterDefinition } from "open-glass-ui";

export function OrganicLabel() {
  return (
    <>
      <OrganicFilterDefinition id="ogui-organic-label" animate={false} />
      <Glass renderer="organic-svg" filterId="ogui-organic-label">
        Experimental surface
      </Glass>
    </>
  );
}
```

Keep animated turbulence decorative and disable it when motion is reduced.

## Opt-in WebGL2

WebGL is isolated in `open-glass-ui/webgl` so a CSS/SVG application does not
load the GPU renderer accidentally.

```tsx
"use client";

import { useRef } from "react";
import { GlassProvider } from "open-glass-ui";
import { WebGLGlassSurface } from "open-glass-ui/webgl";

const regularMaterial = {
  thickness: 0.62,
  ior: 1.46,
  dispersion: 0.012,
  edgeStrength: 0.46,
  bevel: 0.68,
  frost: 0.24,
};

export function RefractedVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <GlassProvider>
      <div className="media-stage">
        <video ref={videoRef} src="/demo.mp4" muted playsInline autoPlay loop />
        <WebGLGlassSurface
          sourceRef={videoRef}
          continuous
          maxDevicePixelRatio={2}
          lenses={[
            {
              x: 240,
              y: 140,
              width: 220,
              height: 92,
              radius: 0.36,
              material: regularMaterial,
            },
          ]}
          onStatusChange={(status) => console.log(status)}
        />
      </div>
    </GlassProvider>
  );
}
```

The WebGL renderer:

- accepts controlled image, canvas, video, `ImageBitmap`, `ImageData`, or
  `OffscreenCanvas` sources;
- supports at most six lenses per shared source;
- responds to resize and device pixel ratio;
- uses video-frame callbacks where available;
- stops drawing while the document is hidden;
- handles context loss/restoration; and
- releases GPU objects, observers, callbacks, frames, and listeners on unmount.

It cannot generally sample arbitrary page pixels. Keep DOM text and controls
outside the canvas and preserve the original media as the fallback.

## SSR and Next.js

The server emits stable semantic DOM with CSS material and no browser-global
probe. Capability detection happens after hydration. In Next.js App Router,
place providers, filters, and WebGL surfaces behind a `"use client"` boundary.
Do not branch server markup on `window`, canvas, SVG support, or WebGL support,
and do not suppress hydration warnings to hide a renderer mismatch.

## Performance guardrails

- Use CSS for normal component surfaces.
- Use WebGL for one or a few high-value controlled-media stages, not forty
  component canvases.
- Keep `maxDevicePixelRatio` at `2` unless real-device evidence justifies more.
- Set `continuous` only for animated sources or effects that need repeated
  drawing.
- Use low quality during live resize; settle to medium/high after geometry
  stabilizes.
- Cache stable SDF maps. Position-only movement must use transforms or filter
  regions.
- Drive high-frequency pointer motion through refs/CSS custom properties, not
  React state on every frame.
- Profile physical mobile and desktop GPUs before making performance claims.

See [Browser Support](./BROWSER-SUPPORT.md),
[Performance](./PERFORMANCE.md), and [Accessibility](./ACCESSIBILITY.md).
