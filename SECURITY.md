# Security Policy

## Supported versions

OpenGlass UI is pre-`1.0`. Security fixes land on the latest published version
only. Older pre-release versions are not patched.

## Reporting a vulnerability

**Do not open a public issue.**

Use GitHub's private vulnerability reporting:
[Report a vulnerability](https://github.com/moekoelueker/open-glass-ui/security/advisories/new).
That channel is private to the maintainers and lets us coordinate a fix and an
advisory before anything is public.

Please include the affected version, a reproduction, the impact you believe it
has, and any browser or platform specifics. Expect an initial response within
seven days. If a report is confirmed, we will agree a disclosure timeline with
you and credit you in the advisory unless you prefer otherwise.

## Scope

This is a client-side rendering library with no network calls, no telemetry, and
no runtime dependencies. The areas most worth scrutiny are:

- **Cross-origin media sampling.** `WebGLGlassSurface` reads image, canvas, and
  video sources. Canvas tainting and CORS behavior matter here.
- **Object URL and GPU resource lifecycle.** Leaks after source swaps, route
  changes, or context loss.
- **Filter and shader input bounds.** Optical parameters are sanitized and
  clamped; a way past that is worth reporting.
- **Injection through props.** Theme colors, filter ids, and class names all
  reach the DOM or a stylesheet.
- **Release provenance.** Packages publish with npm provenance from a GitHub
  Actions workflow. Report anything that undermines that chain.

Denial of service caused by deliberately extreme optical parameters on your own
page is out of scope; those values are yours to set.
