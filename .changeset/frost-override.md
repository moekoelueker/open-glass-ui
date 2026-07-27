---
"open-glass-ui": minor
---

`optics` now affects how a surface renders. Previously `<Glass optics={{ frost }}>`
changed the reported optics and the `data-ogui-*` attributes but nothing visible,
because the CSS material was chosen purely by preset name. An explicit `frost`
value now interpolates blur radius and surface opacity between the three
presets.

The three named materials are unchanged: passing a preset's own frost reproduces
that preset exactly. Accessibility states are unaffected, since forced-colors,
reduced-transparency and the no-backdrop fallback never reintroduce translucency.
