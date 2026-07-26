# OpenGlass UI

The consumer-facing React package for OpenGlass UI: accessible component
recipes, adaptive glass primitives, themes, and optical utilities behind one
ESM import.

> Release candidate: the API may still change before `1.0.0`.

## Install

```sh
pnpm add open-glass-ui react react-dom
```

Import the recipe styles once near your application entry:

```ts
import "open-glass-ui/styles.css";
```

The root and `webgl` entries are React client boundaries. Server components,
build tools, and non-React adapters can import pure utilities without loading
React:

```ts
import { createGlassTheme, signedDistance } from "open-glass-ui/core";
```

## Use

```tsx
import { Button, Glass, GlassSystemProvider } from "open-glass-ui";

export function PlayerControls() {
  return (
    <GlassSystemProvider
      renderer="auto"
      quality="auto"
      motion="system"
      theme={{ appearance: "system" }}
    >
      <Glass material="regular" interactive>
        <Button variant="primary">Play</Button>
      </Glass>
    </GlassSystemProvider>
  );
}
```

`GlassSystemProvider` combines the runtime `GlassProvider`,
`GlassThemeProvider`, and the global `ToastProvider`. Runtime preferences are
top-level props; appearance, tokens, and theme-boundary HTML props live in the
typed `theme` object. Pass `toasts={false}` only when the application supplies
its own toast provider.

## Theme

```tsx
<GlassSystemProvider
  theme={{
    appearance: "dark",
    theme: {
      preset: "cobalt",
      contrast: "high",
      radius: "balanced",
    },
  }}
>
  <App />
</GlassSystemProvider>
```

Use `appearance: "system"` to follow the operating-system preference. Theme
tokens are applied as `--ogui-*` custom properties on the provider's theme
boundary and can be overridden with its `style` or `className` props.

## WebGL (opt in)

The WebGL renderer is a separate entry point so applications that do not need
controlled-media refraction do not load it.

```tsx
import { getMaterialPreset, GlassSystemProvider } from "open-glass-ui";
import {
  type WebGLLens,
  WebGLGlassSurface,
  type WebGLSurfaceStatus,
} from "open-glass-ui/webgl";
import { useRef, useState } from "react";

export function RefractedVideo() {
  const sourceRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<WebGLSurfaceStatus>("idle");
  const lenses: WebGLLens[] = [
    {
      x: 320,
      y: 180,
      width: 220,
      height: 96,
      radius: 0.5,
      material: getMaterialPreset("clear"),
    },
  ];

  return (
    <GlassSystemProvider>
      <video ref={sourceRef} src="/media/demo.mp4" muted playsInline />
      <WebGLGlassSurface
        sourceRef={sourceRef}
        lenses={lenses}
        continuous
        onStatusChange={(nextStatus) => setStatus(nextStatus)}
        aria-label={`Refracted video: ${status}`}
      />
    </GlassSystemProvider>
  );
}
```

`WebGLGlassSurface` accepts image, canvas, and video sources and intentionally
falls back to an unavailable state when WebGL2 is not supported.

## License and independence

OpenGlass UI is available under the [MIT License](./LICENSE).

OpenGlass UI is an independent open-source project. It is not affiliated with,
endorsed by, or sponsored by Apple Inc. “Liquid Glass” is used descriptively;
Apple and its product names are trademarks of Apple Inc.
