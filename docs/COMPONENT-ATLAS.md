# Component Atlas

The component atlas turns the five renderer experiments into a weighted product
decision and subjects the top three to the same forty-component library burden.
It is a design judgment backed by shared implementation, browser checks, and
visual evidence—not a claim that aesthetics can be measured scientifically.

## Weighted ranking

The requested weighting gives visual appeal half of the final score:

| Rank | Engine | Visual 50% | Flexibility 20% | AI / integration 15% | Performance 10% | Resilience 5% | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Adaptive Hybrid | 9.2 | 9.8 | 9.7 | 8.5 | 10.0 | **9.36** |
| 2 | Native CSS | 8.7 | 9.8 | 9.6 | 10.0 | 10.0 | **9.25** |
| 3 | Spectral WebGL | 9.7 | 7.8 | 7.8 | 6.5 | 8.5 | **8.66** |
| 4 | Organic SVG | 9.5 | 7.5 | 8.0 | 7.0 | 9.0 | **8.60** |
| 5 | Geometric SDF | 8.6 | 8.8 | 8.5 | 8.0 | 9.0 | **8.59** |

### Recommendation

**Adaptive Hybrid is the preferred system.** It does not have WebGL's absolute
visual ceiling or CSS's absolute simplicity, but it is the only approach that
can expose both behind one semantic vocabulary while preserving accessible
fallbacks. CSS remains the automatic baseline; consumers explicitly opt into
SDF/SVG or controlled-media WebGL only when the source and payoff justify it.

**Native CSS is the preferred library foundation.** It is the cheapest to ship,
easiest to inspect, easiest for an agent to extend, and most compatible with
arbitrary DOM. A consumer should be able to use the complete library without
shipping WebGL.

**Spectral WebGL is the preferred hero specialist.** It is the most visually
striking approach because it can sample a controlled image or video source. It
is intentionally limited to large, high-value surfaces; rendering forty GPU
canvases would be both slower and less legible.

Organic SVG narrowly misses the top three. Its irregularity is excellent for
expressive moments but becomes noisy when repeated across dense forms and data.
SDF optics remains a strong geometry adapter, but its authoring and debugging
surface is more technical than CSS and its visual payoff is lower than WebGL.

## Three distinct art directions

The finalist routes use the same React contracts and live components while
changing layout, material strategy, and visual hierarchy:

- `/library/hybrid` — dense systems glass, capability telemetry, four-column
  control matrix, neutral adaptive theme, and user-selectable accents.
- `/library/css` — light editorial composition, native layered translucency,
  asymmetric two-column specimens, serif display typography.
- `/library/webgl` — cinematic controlled-media stage, source-aware refraction,
  spectral edge color, spacious three-column component field.

These are not corner-radius or palette variations. The expensive optical engine
appears once where it adds value; the forty control surfaces remain semantic DOM.

## Forty-component surface

1. Button
2. IconButton
3. SegmentedControl
4. Switch
5. Slider
6. Toolbar
7. Dock
8. Tabs
9. Menu
10. MenuItem
11. Popover
12. Tooltip
13. MediaControls
14. Badge
15. Avatar
16. AvatarGroup
17. Card
18. Stat
19. Progress
20. Meter
21. Spinner
22. Skeleton
23. Alert
24. Banner
25. Breadcrumbs
26. Pagination
27. Accordion
28. Dialog
29. Drawer
30. Toast
31. Checkbox
32. RadioGroup
33. Select
34. TextField
35. Textarea
36. SearchField
37. NumberField
38. Stepper
39. ToggleButton
40. FileDropzone

All controls use native HTML semantics. Stateful recipes accept predictable
controlled and uncontrolled props, event callbacks use consistent
`onValueChange`-style names, and every icon-only action requires an accessible
name. Those conventions make the surface easier for both humans and coding
agents to discover and compose.

## Performance policy

- DOM text and controls never become canvas content.
- WebGL is restricted to owned media and one hero surface.
- CSS is the universal arbitrary-DOM path.
- Runtime capability and accessibility preferences select fallbacks.
- Off-screen atlas categories use `content-visibility: auto`.
- Micro-animations are transform/opacity based and disabled or reduced with the
  user's motion preference.

The showcase bundle includes the research site and all five experimental
engines, so it is not a per-consumer library cost. The release-candidate package
is now measured separately: the public root facade excludes WebGL inputs,
`open-glass-ui/webgl` is a distinct opt-in entry, and a minimal core import is
tree-shaken independently. Current byte measurements and their exact method are
recorded in [Performance](./PERFORMANCE.md).

## Second visual pass

The follow-up pass improved:

- Hybrid: clearer renderer-policy telemetry and restrained component borders.
- CSS: darker semantic status colors on light material and stronger form
  contrast.
- WebGL: one controlled optical stage rather than repeated GPU surfaces.
- All variants: semantic ranking markup, modal focus
  entry/trap/restoration, corrected field labeling, and an explicitly named
  file input.

The later OpenGlass UI release-candidate pass added neutral light/dark defaults
and a live theme studio for presets and custom
accent/secondary/tertiary colors. Its current screenshots live in
`artifacts/screenshots/open-glass-ui-final`; the historical paths below predate
that pass.

Historical visual evidence is checked in at:

- `artifacts/screenshots/atlas-pass-01`
- `artifacts/screenshots/atlas-pass-02`

Each pass contains ranking, hero, and representative component captures at
desktop and mobile sizes in Chromium, Firefox, and WebKit.

## Public product landing evidence

The public `/` route now presents one OpenGlass UI system instead of the
renderer comparison. The canonical `/components` route exposes the complete
forty-recipe catalog without rank or engine framing, while `/research` retains
the five-engine decision record.

Eleven focused landing contracts pass in each of Chromium, Firefox, and WebKit:
product messaging, one-line sticky navigation, authoritative playground state,
interactive lens response, material-anatomy explanations, product
compositions, install/AI resources, Axe, 320/390 px boundaries, reduced motion,
and the canonical component catalog. Six dedicated landing captures—desktop
and mobile in all three browser engines—are included in
`artifacts/screenshots/open-glass-ui-final`.

## Historical atlas validation

The 2026-07-24 atlas pass recorded 65 unit/property/SSR/recipe checks and 42
atlas-specific browser/capture checks across Chromium, Firefox, and WebKit.
That historical pass rendered forty unique component specimens per finalist,
reported no automatically detectable Axe violations, found no document-level
horizontal overflow at desktop or 390 px mobile, and exercised the principal
overlay, navigation, feedback, and form interactions.

Those counts predate the OpenGlass UI theming and interaction-hardening pass and
must not be presented as the final release-candidate result. See
[Validation](./VALIDATION.md) for the current verification status and refreshed
evidence.

The atlas now uses the owner-approved OpenGlass UI identity and the
`open-glass-ui@0.1.0` package. Deployment and
npm publication remain intentionally unauthorized.
