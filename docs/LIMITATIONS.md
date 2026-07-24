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
- Full screen-reader testing requires human assistive-technology review in
  addition to automated semantics checks.

## Non-goals

- Pixel reproduction of a proprietary native renderer.
- Apple assets, fonts, icons, or branding.
- Unqualified “physically accurate” claims.
- Experimental HTML-in-Canvas or WebGPU as the required production path.

