# Changelog

All notable OpenGlass UI changes will be recorded here. The project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and will
adopt semantic versioning for published packages.

## Unreleased

- Final release-candidate browser, accessibility, package-consumer, and visual
  verification.
- Real repository, homepage, and issue-tracker metadata after an authorized
  public remote exists.

## 0.1.0-rc.0 — 2026-07-25

Prepared locally; not published to npm or a public GitHub remote.

### Added

- The owner-approved OpenGlass UI identity, `open-glass-ui` consumer facade,
  and `@open-glass-ui/*` implementation packages.
- Neutral adaptive light/dark themes with high-contrast defaults, semantic
  color/radius tokens, six optional accent presets, and custom
  accent/secondary/tertiary colors.
- Forty native-DOM React recipes, glass primitives, providers, renderer hooks,
  and a global toast queue.
- CSS-first `auto`, explicit SVG/SDF enhancements, and controlled-media WebGL2
  through the opt-in `open-glass-ui/webgl` entry.
- Server-safe framework-independent utilities through `open-glass-ui/core`.
- Human and AI integration, renderer, theme, accessibility, performance,
  limitation, migration, and release guidance.

### Changed

- The research prototype's engine comparison is now a consumer-oriented design
  system with a single public package facade.
- The default visual identity is neutral rather than a fixed green accent.

### Security

- Environment credentials and the raw NamingSignal research ledger remain
  ignored local files and are not included in package or repository output.
