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

## Pass 2 — complete

Date: 2026-07-24

### Automated results

- 60 unit, property, SSR, strict-lifecycle, and recipe behavior tests passed.
- 62 second-pass functional/accessibility checks passed across Chromium,
  Firefox, and WebKit; four checks were intentionally skipped where Playwright
  does not expose forced-colors or deterministic context-loss control.
- Six visual-capture jobs passed and produced 81 pass-02 screenshots.
- The full browser run therefore passed 68 checks with seven intentional skips.
- The separately isolated Chromium performance probe passed; Firefox and WebKit
  were intentionally excluded from reference-host performance claims.
- All packages built, packed, installed together into a temporary consumer,
  imported through declared exports, preserved React peer dependencies, and
  passed a tree-shaking probe.
- The Vite showcase and Next.js SSR fixture built successfully.

### Stress and lifecycle coverage

- Default, hover, pressed, focused, disabled, selected, and open states.
- Menu selection, outside lifecycle, Escape, and focus restoration.
- Popover open/Escape/focus restoration and tooltip hover/focus.
- Every route’s material, slider, and spectral controls.
- Reduced motion and frozen video.
- Emulated reduced transparency and forced colors.
- Low-concurrency automatic quality.
- Unsupported WebGL2 fallback.
- Portrait-to-landscape resizing with no horizontal overflow.
- Internal route transitions and strict-mode remounting.
- Video source removal and reattachment.
- Synthetic hidden/visible document transitions.
- WebGL context loss and restoration.
- WebGL, video, animation, observer, and listener cleanup through repeated
  unmounting.

### Screenshot inventory

```text
artifacts/screenshots/pass-02/
  chromium/{desktop,mobile}/
  firefox/{desktop,mobile}/
  webkit/{desktop,mobile}/
```

Each browser has 27 approved JPEG captures:

- one desktop and one mobile home;
- desktop and mobile hero views for all five routes;
- desktop and mobile instrument views for all five routes;
- desktop six-background matrices for all five routes.

All 81 images were visually inspected. The review checked composition, source
visibility, filter bounds, clipping, seams, text sharpness, background contrast,
native-control differences, route identity, and consistency across engines.

### Visual findings

- CSS is the most stable and readable renderer across all backgrounds.
- Organic SVG has the strongest expression; the protected core prevents the
  contour field from consuming controls.
- SDF output stays deterministic, and the new fiducials make its geometry
  understandable.
- WebGL2 produces coherent large and small refraction lenses in all three
  browser engines with the generated video source.
- Hybrid has the strongest complete product posture and communicates active
  policy clearly.
- WebKit and Firefox expose expected native range-thumb differences without
  layout or contrast failures.
- Mobile keeps the instrument usable and text sharp; route-specific annotations
  intentionally recede to protect the compact layout.

### Performance evidence

Reference host results are checked into `artifacts/performance/`.

- CSS material-state update p95: 18.5 ms.
- WebGL2 active-window frame interval: 18.5 ms median, 33.4 ms p95 on the
  headless software-backed reference run.
- No active-window long task was observed.
- Cold development startup recorded a 448 ms longest task; it is retained as an
  honest non-production baseline rather than treated as a release claim.
- Post-transition resource probe: zero WebGL surfaces and zero instrument videos.

Map-generation p95 stayed within the low-quality budget for every shape and
within the medium budget except one noisy rounded-rectangle run (19.792 ms).
That outlier reinforces the existing policy: regenerate low quality during
resize, cache stable maps, and settle to medium/high after interaction.

### Manual in-app browser pass

The comparison home, five experiment routes, architecture view, and validation
view were inspected in the in-app browser. Menu, popover, lab controls, motion,
and WebGL readiness were exercised. No console error remained.

### Approved conclusion

No critical accessibility, runtime, lifecycle, packaging, or responsive defect
remains in the review build. The adaptive hybrid is approved as the architectural
foundation for user review, subject to the public-release work listed in
`LIMITATIONS.md`.

## Pass 3 — component atlas complete

Date: 2026-07-24

- The recipe surface expanded from thirteen to forty components.
- Unit/property/SSR/recipe coverage increased from 60 to 65 passing checks.
- The atlas-specific suite passes 42 checks across Chromium, Firefox, and WebKit.
- Hybrid, CSS, and WebGL each render the same forty unique live specimens.
- Axe reports no automatically detectable violations on any finalist route.
- Dialog focus entry, Tab containment, Escape closure, and trigger restoration
  are verified.
- Pagination, accordion, toast, search, bounded number input, stepper, and file
  selection behavior are verified in the browser.
- Desktop and 390×844 layouts remain within the document boundary.
- WebGL remains one controlled-media hero surface and reaches a stable ready or
  explicit unavailable state.

Two atlas visual passes produced 84 screenshots:

```text
artifacts/screenshots/atlas-pass-01/
artifacts/screenshots/atlas-pass-02/
```

Each pass includes the weighted ranking, all three finalist heroes, and a
representative live Button specimen at desktop and mobile sizes in all three
browser engines. The second pass tightened CSS light-theme semantic contrast,
modal focus behavior, form labeling, and semantic ranking markup. The approved
weighted result is Adaptive Hybrid 9.36, Native CSS 9.25, and Spectral WebGL
8.66.
