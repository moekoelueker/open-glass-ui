---
"open-glass-ui": minor
---

Readability, layering and form fixes from an adversarial review. No API is removed.

Added

- Native-control recipes forward refs to their element: `Button`, `IconButton`, `TextField`, `Textarea`, `Checkbox`, `Switch`, `Select`, `SearchField`, `NumberField`, `Slider` and `ToggleButton`.
- `resolveToneTheme(theme, tone)` and `GlassThemeRuntime.input`, so code outside a `Glass` can read the palette of a forced tone.
- `readableForeground(background, { over })` judges an ink over several backgrounds; the theme emits `--ogui-color-accent-highlight-mix`.
- `WebGLGlassSurface` reports why it is unavailable (`data-ogui-webgl-reason` and a second `onStatusChange` argument); `WebGLGlassRenderer.clear()`.
- `llms.txt` and `llms-full.txt` ship in the package and are tested against the real exports.

Changed

- `<Glass tone="dark">` in a light app (and the reverse) now gives its text and nested recipes that tone's palette. Menus and popovers with a forced `tone` do the same. Previously they kept the app's ink, which could put dark text on dark glass.
- Accent ink reaches 4.5:1 against the whole liquid accent fill. The theme lowers the white highlight where needed, the liquid primary fill is opaque, and its hover lifts the shadow instead of brightening the fill. Some light presets now use `#ffffff` ink instead of `#f9f8f3`.
- The pointer glint on liquid accent fills stays in a thin band at the top edge, so it never sits behind the label.
- Dialogs, drawers, menus, popovers and tooltips share one layer stack: the most recently opened layer paints on top, Escape closes one layer at a time, a menu inside a dialog works and paints above it, and a dialog opened over a popover makes the popover inert. Dialog focus no longer jumps while a parent re-renders. Toasts stay live while a dialog is open.
- `NumberField` can be cleared and accepts intermediate input such as `-`. It clamps on blur or Enter, not on every keystroke.
- `Slider` shows the same value the native input holds, including step alignment.
- `TextField`, `Textarea`, `Checkbox` and `Switch` keep a caller's `aria-describedby` and `aria-invalid`.
- A disabled or read-only `SearchField` can no longer be cleared.
- A hover-only `Tooltip` closes on Escape, and its bubble can be hovered.
- A focused or hovered `Toast` stays paused until both end.
- `useSdfFilter` follows the provider's resolved quality unless you pass one.
- `WebGLGlassSurface` turns off under forced colors and reduced transparency, and redraws static sources when lenses change.

Fixed

- The liquid edge ring no longer escapes static elements; the dialog close button drew an ellipse across the whole dialog.
- Liquid menus and popovers no longer animate under reduced motion or `motion="off"`.
- Liquid styles no longer leak into a classic scope nested inside liquid inside classic, and descendant rules respect the nearest scope.
- The Dialog and Drawer description is padded like the title and body.
- A pressed liquid `ToggleButton` keeps its accent fill on hover.
