# Changelog

All notable OpenGlass UI changes will be recorded here. The project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and
semantic versioning for the published `open-glass-ui` package.

## 0.3.0 — 2026-08-03

A second-pass quality release: independent accessibility and renderer audits
of the whole surface, with every confirmed finding fixed.

### Added

- `Dialog` and `Drawer` work without the built-in trigger. `triggerLabel` is
  now optional; when omitted nothing renders inline and the overlay is driven
  entirely through `open`/`onOpenChange`. On close, focus returns to the
  element that opened the overlay (menu item, command palette, shortcut), not
  just the built-in trigger.
- `Banner` accepts `onDismiss`, so applications can observe and persist
  dismissal.
- `Accordion` accepts `defaultOpenIds` (pass `[]` to start fully collapsed)
  and `headingLevel` so item titles fit the page outline.
- The renderer utilities and types ship from the `open-glass-ui` facade:
  `RendererCapabilities`, `RendererPreference`, `RendererSource`,
  `MaterialTone`, `detectRendererCapabilities`, `selectRenderer`,
  `createCssMaterialTokens`, `createCssMaterialStyle`, and the SVG filter
  helpers. Consumers can finally name the types referenced by `Glass` props
  and `useGlassCapabilities`.

### Changed

- `MediaControls` draws play, pause, and volume as inline vector icons
  instead of text glyphs ("▶" could render as emoji per platform, and "M"/"V"
  read as mystery letters), and the seek slider announces
  "0:42 of 3:04"-style times through `aria-valuetext`.
- `Card`'s `interactive` prop now applies the hover treatment it always
  implied (it was a documented no-op). Focusability and the button role still
  require a real `onPress`/`onClick`.
- `Popover` moves focus to its first focusable control on open, so portaled
  popover content is keyboard-reachable.
- `Spinner` slows to a 1.6s rotation under reduced motion instead of
  freezing into a static arc.

### Fixed

- `Glass` no longer crashes when an optics field is explicitly `undefined`
  (for example `optics={{ thickness: cond ? 0.9 : undefined }}`); the preset
  value now wins.
- `WebGLGlassSurface` re-arms its frame loop when `renderKey` changes, so a
  late-attached or swapped video source animates instead of freezing on one
  painted frame. The continuous loop also respects the resolved motion
  preference.
- A restored WebGL context that fails to recompile resources reports the
  surface as still lost instead of throwing inside a DOM event listener.
- `useSdfFilter` no longer generates the displacement map during render, and
  never on the server; generation happens in a client effect backed by a
  shared optics cache, so SSR pays only for a cache key and identical
  geometry is generated once.
- `OrganicFilterDefinition` stops its SMIL turbulence animation when the
  resolved motion preference is off; stylesheets cannot stop SMIL.
- `Tooltip` is dismissible with Escape and reappears after the pointer
  leaves or focus moves on (WCAG 1.4.13).
- `Banner` derives its accessible name from the rendered title. Element
  titles no longer produce an "[object Object]" name, and a consumer-supplied
  `aria-label` or `aria-labelledby` is respected.
- `FileDropzone` announces selection and rejection through one stable status
  region instead of swapping `status`/`alert` roles on the same node.
- Forced colors: the selected tab, pressed `ToggleButton`, current
  `Pagination` page, `Stepper` states, and checked `Checkbox` are visibly
  distinct, and unchecked checkboxes no longer show a forced check glyph.
- The branded focus ring covers every interactive recipe (pagination,
  breadcrumbs, accordion headers, and alert, banner, toast, overlay, search,
  number, and stepper buttons); a dead switch focus selector was removed.
- `Toast` action buttons meet the minimum touch-target size.
- `AvatarGroup`'s hover transition honors reduced motion.
- Menus and popovers rendered by `DisclosureSurface` avoid a React 18
  development-mode SSR warning by using an isomorphic layout effect.

## 0.2.0 — 2026-07-26

### Fixed

- `optics` now affects how a surface renders. Previously
  `<Glass optics={{ frost }}>` changed the reported optics and `data-ogui-*`
  attributes but nothing visible, because the CSS material was chosen purely
  by preset name. An explicit `frost` interpolates blur radius and surface
  opacity between the presets; a preset's own frost reproduces that preset
  exactly, and the accessibility fallback states never reintroduce
  translucency.

## 0.1.1 — 2026-07-26

### Changed

- Documentation only. The README shows the forty components as live captures
  grouped by purpose, plus the material studies and theme studio, instead of
  listing component names in prose.

## 0.1.0 — 2026-07-26

### Added

- First public release on npm. Forty accessible React components on a
  CSS-first glass material, adaptive light and dark themes, customizable
  accents, and opt-in WebGL refraction for owned media. Ships as a single
  package with zero runtime dependencies and a server-safe
  `open-glass-ui/core` entry.

## 0.1.0-rc.0 — 2026-07-25

Prepared locally; not published to npm or a public GitHub remote.

### Added

- The owner-approved OpenGlass UI identity, `open-glass-ui` consumer facade,
  and `@open-glass-ui/*` implementation packages.
- Neutral adaptive light/dark themes with high-contrast defaults, semantic
  color/radius tokens, six optional accent presets, and custom
  accent/secondary/tertiary colors.
- Forty native-DOM React recipes, glass primitives, providers, renderer hooks,
  and a global toast queue.
- CSS-first `auto`, explicit SVG/SDF enhancements, and controlled-media WebGL2
  through the opt-in `open-glass-ui/webgl` entry.
- Server-safe framework-independent utilities through `open-glass-ui/core`.
- Human and AI integration, renderer, theme, accessibility, performance,
  limitation, migration, and release guidance.

### Changed

- The research prototype's engine comparison is now a consumer-oriented design
  system with a single public package facade.
- The default visual identity is neutral rather than a fixed green accent.

### Security

- Environment credentials and the raw NamingSignal research ledger remain
  ignored local files and are not included in package or repository output.
