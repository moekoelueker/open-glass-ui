# Known Limitations

## Current

- OpenGlass UI is `0.1.0`, an early public release. Pre-`1.0.0` APIs can still
  change; pin an exact version if you need stability.
- The `open-glass-ui` npm name and the GitHub repository are held by the
  project, but no domain or trademark right has been registered or legally
  cleared.
- Live backdrop refraction is not a portable baseline.
- SVG filters can have browser-specific caching, source-size, and compositing
  behavior.
- WebGL2 can refract controlled media but cannot generally sample arbitrary page
  pixels.
- Reduced-transparency detection is not uniformly available, so an explicit demo
  override is required for validation.
- The checked WebGL performance baseline uses headless Chromium with a
  software-capable context; it is not a mobile-GPU claim.
- The final headless reference run observed no startup or active-window long
  task and all medium-quality maps met their p95 budget. These measurements
  remain host-specific rather than broad device claims.
- The generated demonstration video is H.264 only; a public demo should add a
  second broadly appropriate codec if its support target requires one.
- Full screen-reader testing requires human assistive-technology review in
  addition to automated semantics checks.

## Before public release

- Repeat exact namespace checks and complete a confusing-similarity review for
  the selected name.
- Complete the facade/API review and define the pre-`1.0` semver/support policy.
- Test physical iOS Safari, Android Chrome, macOS Safari/Firefox/Chrome, and
  Windows Firefox/Chrome/Edge across representative GPU tiers.
- Complete VoiceOver and NVDA review, 200–400% zoom review, and touch target
  review on physical devices.
- Confirm the explicit `open-glass-ui/webgl` subpath and SVG fallbacks in packed
  external consumers.
- Add production bundle budgets and real-device frame/memory traces.
- Add real repository, homepage, and issue-tracker metadata only after an
  authorized remote exists.
- Publish the prepared public packages only after explicit owner authorization.

## Non-goals

- Pixel reproduction of a proprietary native renderer.
- Apple assets, fonts, icons, or branding.
- Unqualified “physically accurate” claims.
- Experimental HTML-in-Canvas or WebGPU as the required production path.
