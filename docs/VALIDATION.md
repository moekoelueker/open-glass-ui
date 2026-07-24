# Validation

## Pass 1 — complete

Date: 2026-07-24

- 60 unit, property, SSR, and recipe behavior tests passed.
- 39 functional and automated accessibility checks passed across Chromium,
  Firefox, and WebKit.
- Desktop and mobile overflow checks passed.
- Every route rendered the same instrument, lab, six-background matrix, and
  recipe inventory.
- Menu, popover, tab, segmented control, switch, material change, focus
  restoration, and WebGL readiness states were exercised.
- 81 browser-specific screenshots were captured at 1440×1000 and 390×844 with
  reduced motion enabled.
- Chromium, Firefox, and WebKit captures were visually inspected for clipping,
  seams, contrast, text sharpness, and renderer consistency.
- No console warnings or errors appeared during the in-app browser interaction
  pass.

### Screenshot inventory

Screenshots are separated by pass, browser, and viewport:

```text
artifacts/screenshots/pass-01/
  chromium/{desktop,mobile}/
  firefox/{desktop,mobile}/
  webkit/{desktop,mobile}/
```

Desktop evidence includes home, route hero, instrument, and background matrix.
Mobile evidence includes home, route hero, and instrument.

### Visual review notes

- Browser font rendering and native range thumbs differ, as expected.
- Organic contours remain aligned and readable in all engines.
- WebGL2 produced coherent large and small lenses in all three automated browser
  engines.
- The light CSS page, dark routes, noisy tile, high-chroma tile, original
  architectural photo, and animated canvas all retained readable control text.
- Full-page Chromium screenshots with large backdrop-filter regions can show
  compositor stitching artifacts; approved evidence therefore uses bounded hero,
  instrument, and matrix captures.

## Pass 2 — pending

The complete suite will be rerun after every route receives the improvements
listed in `EXPERIMENT-REPORT.md`. Pass 2 will use a separate screenshot tree.
