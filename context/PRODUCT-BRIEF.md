# Product Brief

## Product

**OpenGlass UI** is an open-source React and web design system for dimensional,
glass-like interfaces that remain accessible, configurable, performant, and
practical.

Tagline:

> The open-source Liquid Glass UI system for React and the web.

Product thesis:

> Make the interface feel dimensional. Keep the product usable.

## Why it exists

Most glass UI examples fall into one of three traps:

1. They are isolated visual effects rather than usable component systems.
2. They depend on one expensive or browser-specific rendering technique.
3. They sacrifice text clarity, interaction semantics, accessibility, or
   maintainability for a hero screenshot.

OpenGlass UI is intended to provide the strongest free, open-source answer for a
developer searching for Liquid Glass UI on the web: a system that looks
premium, teaches how its materials work, supplies real components, and remains
safe to adapt.

## Primary audiences

- React developers who want a premium glass design system.
- Product designers and design engineers building dimensional interfaces.
- AI coding agents generating or adapting React UI.
- Open-source learners studying practical CSS/SVG/WebGL tradeoffs.
- Teams that need graceful fallbacks rather than one browser-specific demo.

## User promise

A consumer should be able to:

- Install one facade package and one stylesheet.
- Start with neutral, high-contrast light or dark UI.
- Choose an accent preset or custom accent/secondary/tertiary colors.
- Use forty accessible components without understanding shader math.
- Add glass selectively to navigation, controls, panels, overlays, or owned
  media.
- Keep arbitrary DOM on the CSS-first path.
- Opt into enhanced SVG/SDF or WebGL only where the visual payoff justifies it.
- Preserve SSR, hydration, keyboard behavior, reduced motion, reduced
  transparency, and forced colors.

## Experience principles

### Premium, not ornamental

Materials need dimensional edges, coherent highlights, controlled blur,
deliberate shadows, and disciplined contrast. Avoid generic translucent cards
over purple/cyan gradients.

### Sharp content over soft material

Glass may diffuse the source beneath it. It must not make foreground text,
icons, focus rings, or control states blurry.

### Neutral by default

- Dark background: white and slightly off-white foregrounds.
- Light background: black or suitably dark foregrounds.
- Accent color is optional, not the primary source of contrast.
- Semantic foreground calculation must remain safe when custom colors are used.

### Irregularity with restraint

The owner prefers formed, organic, slightly asymmetric shapes over perfect
spheres. Morphing blobs and off-shape optical fields can create personality,
but dense forms and text surfaces should remain calmer.

### Spectacle at the edges

Use stronger dispersion, morphing, and refraction for owned imagery, video,
hero surfaces, or selected moments. Do not turn every form control into a GPU
effect.

### Show the system in use

Demonstrations should include working product compositions, not only isolated
component tiles. Controls should visibly change authoritative state.

### AI-friendly by construction

Public imports, controlled/uncontrolled conventions, labels, theme inputs,
renderer boundaries, and examples must be predictable enough for coding agents
to use without inventing APIs.

## Current scope

- React 18+ and modern web browsers.
- TypeScript and ESM.
- CSS-first materials.
- Explicit SVG/SDF filters.
- Opt-in WebGL2 controlled-media refraction.
- Forty native-DOM component recipes.
- Neutral adaptive theme provider and semantic tokens.
- Vite showcase and Next.js compatibility fixture.
- Machine-readable AI integration references.

## Non-goals

- Pixel reproduction of Apple’s proprietary native renderer.
- Apple assets, fonts, icons, or branding.
- A claim of physical spectral accuracy.
- WebGL as the required path for standard controls.
- Arbitrary live page-pixel sampling.
- Required WebGPU or experimental HTML-in-Canvas.
- React Native support in the current release.
- Publishing, deployment, or namespace reservation without owner approval.

## Success criteria

### Visual

- Premium and distinctive at desktop and mobile sizes.
- Strong material depth without reducing legibility.
- High contrast on hostile imagery and motion.
- Coherent light behavior rather than decorative stripes.
- Consistent enough across Chromium, Firefox, and WebKit.

### Product

- Forty working components.
- Real use-case compositions.
- Neutral/custom theming.
- One public facade.
- Clear quickstart and AI guidance.

### Engineering

- React 18+ peer compatibility.
- SSR-safe rendering and deterministic hydration.
- CSS-only consumers do not load WebGL.
- Clean lifecycle teardown.
- Explicit fallbacks and accessibility modes.
- Browser, package, unit, performance, and visual evidence.

### Launch

- GitHub and npm ready after explicit authorization.
- Documentation, release checklist, license, contribution, and security posture.
- Enough polished material for a launch video and moluker.com article.
