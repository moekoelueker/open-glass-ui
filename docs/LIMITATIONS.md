# Known Limitations

## Current

- This is an internal research prototype, not a supported package release.
- The public name and API are not frozen.
- Live backdrop refraction is not a portable baseline.
- SVG filters can have browser-specific caching, source-size, and compositing
  behavior.
- WebGL2 can refract controlled media but cannot generally sample arbitrary page
  pixels.
- Reduced-transparency detection is not uniformly available, so an explicit demo
  override is required for validation.
- The checked WebGL performance baseline uses headless Chromium with a
  software-capable context; it is not a mobile-GPU claim.
- Cold development startup produced a 448 ms long task on the reference run.
  Production profiling and code splitting are required before release.
- A medium-quality rounded-rectangle generation sample exceeded the 12 ms p95
  research budget. Resize interactions should remain low quality and cached.
- The generated demonstration video is H.264 only; a public demo should add a
  second broadly appropriate codec if its support target requires one.
- Full screen-reader testing requires human assistive-technology review in
  addition to automated semantics checks.

## Before public release

- Approve a collision-checked public name, package scope, and domain.
- Freeze the API and define semver/support policy.
- Test physical iOS Safari, Android Chrome, macOS Safari/Firefox/Chrome, and
  Windows Firefox/Chrome/Edge across representative GPU tiers.
- Complete VoiceOver and NVDA review, 200–400% zoom review, and touch target
  review on physical devices.
- Decide whether WebGL2 and organic filters are separate optional exports.
- Add production bundle budgets and real-device frame/memory traces.
- Remove `private`, set release versions, and publish only after explicit user
  authorization.

## Non-goals

- Pixel reproduction of a proprietary native renderer.
- Apple assets, fonts, icons, or branding.
- Unqualified “physically accurate” claims.
- Experimental HTML-in-Canvas or WebGPU as the required production path.
