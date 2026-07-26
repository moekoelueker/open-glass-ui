<!-- Absolute URLs: npm renders this README outside the repository. -->
<p align="center">
  <img
    src="https://raw.githubusercontent.com/moekoelueker/open-glass-ui/main/apps/showcase/public/og-image.png"
    alt="OpenGlass UI. Glass is not a blur. It is an interface system."
    width="820"
  />
</p>

<h1 align="center">OpenGlass UI</h1>

<p align="center">
  <strong>The open-source Liquid Glass UI system for React and the web.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/open-glass-ui"><img alt="npm" src="https://img.shields.io/npm/v/open-glass-ui?color=%23111827&labelColor=%23111827&logo=npm&logoColor=white"></a>
  <a href="https://github.com/moekoelueker/open-glass-ui/blob/main/LICENSE"><img alt="MIT" src="https://img.shields.io/npm/l/open-glass-ui?color=%23111827&labelColor=%23111827"></a>
  <a href="https://www.npmjs.com/package/open-glass-ui?activeTab=dependencies"><img alt="zero dependencies" src="https://img.shields.io/badge/runtime%20deps-0-111827?labelColor=%23111827"></a>
  <a href="https://github.com/moekoelueker/open-glass-ui"><img alt="GitHub" src="https://img.shields.io/github/stars/moekoelueker/open-glass-ui?color=%23111827&labelColor=%23111827&logo=github"></a>
</p>

Forty accessible React components on a CSS-first glass material, with adaptive
light and dark themes, customizable accents, and opt-in refraction for media
you own. Text, focus, and keyboard behavior stay native DOM.

- **One package, zero runtime dependencies.** React and React DOM are peers.
- **CSS-first.** `renderer="auto"` never silently escalates to WebGL.
- **Accessible by construction.** Reduced motion, reduced transparency, and
  forced colors are designed states, not afterthoughts.
- **SSR and RSC safe.** Ships a server-safe `core` entry that never imports
  React.
- **Built for AI agents.** Predictable APIs plus `llms.txt` references.

> **Pre-1.0.** The API may still change before `1.0.0`. Pin an exact version if
> you need stability.

OpenGlass UI is physics-inspired, not a physically accurate spectral renderer,
and CSS implies rather than performs true arbitrary-DOM refraction. See
[Limitations](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/LIMITATIONS.md).

## Install

```sh
npm install open-glass-ui react react-dom
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

## Documentation

| | |
| --- | --- |
| [Components](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/COMPONENTS.md) | All forty components and their props |
| [Theming](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/THEMING.md) | Tokens, presets, custom accents |
| [Renderers](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/RENDERERS.md) | How CSS, SVG, and WebGL are chosen |
| [Accessibility](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/ACCESSIBILITY.md) | Keyboard, ARIA, and preference handling |
| [AI-agent usage](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/AI-USAGE.md) | Guidance for coding agents |
| [Browser support](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/BROWSER-SUPPORT.md) | Baselines and fallbacks |
| [Limitations](https://github.com/moekoelueker/open-glass-ui/blob/main/docs/LIMITATIONS.md) | What this does not claim to do |

## Contributing

Issues and pull requests are welcome. Start with
[CONTRIBUTING.md](https://github.com/moekoelueker/open-glass-ui/blob/main/CONTRIBUTING.md).

## License and independence

OpenGlass UI is available under the [MIT License](./LICENSE).

OpenGlass UI is an independent open-source project. It is not affiliated with,
endorsed by, or sponsored by Apple Inc. “Liquid Glass” is used descriptively;
Apple and its product names are trademarks of Apple Inc.
