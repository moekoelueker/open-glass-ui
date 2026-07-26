# Support

OpenGlass UI is pre-`1.0`. The API may change between minor versions; pin an
exact version if you need stability. There is no commercial support contract.

- **Questions and ideas:** [GitHub Discussions](https://github.com/moekoelueker/open-glass-ui/discussions)
- **Bugs:** [open an issue](https://github.com/moekoelueker/open-glass-ui/issues/new/choose)
- **Vulnerabilities:** [SECURITY.md](./SECURITY.md), never a public issue

## Compatibility target

| Surface | Supported |
| --- | --- |
| React | 18 and 19 |
| Chromium | Current evergreen releases |
| Firefox | Current evergreen releases |
| Safari/WebKit | Current evergreen releases |
| Server rendering | React SSR and Next.js App Router/RSC |
| Baseline renderer | CSS-first semantic DOM |
| Enhanced renderers | SVG/SDF where supported; WebGL2 by explicit import |

Browsers without a supported enhancement keep the original DOM and fall back to
CSS or opaque treatment. Physical-device, screen-reader, and real-GPU coverage
is still required before broad support claims; see
[`docs/LIMITATIONS.md`](./docs/LIMITATIONS.md).

## Reporting a problem

Before reporting a problem, capture:

- Browser and version.
- Operating system and device class.
- Renderer selected by the demo.
- Route and material preset.
- Reduced-motion/transparency or forced-colors state.
- Reproduction steps, console output, and a screenshot.

The repository includes structured bug and feature-request templates. Security
issues should follow [`SECURITY.md`](./SECURITY.md), not a public issue.
