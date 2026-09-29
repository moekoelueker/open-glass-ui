# Performance Baseline

Measured: 2026-07-25 PT (2026-07-26 UTC in the machine-readable reports)

Environment:

- Apple arm64 macOS host.
- Node v24.11.1.
- 30 timed generations after one warm-up generation.
- `regular` material.
- Synchronous main-thread benchmark; browser and worker numbers will be recorded
  separately during renderer validation.

Run:

```bash
pnpm run bench:optics
```

## Optics map generation

| Shape        |           Low p95 |           Medium p95 |             High p95 |
| ------------ | ----------------: | -------------------: | -------------------: |
| Circle       | 1.662 ms at 72×72 | 4.736 ms at 132×132 | 14.412 ms at 240×240 |
| Capsule      | 1.276 ms at 96×38 |  4.072 ms at 176×70 | 15.051 ms at 320×128 |
| Rounded rect | 2.434 ms at 96×62 | 7.082 ms at 176×114 | 22.527 ms at 320×208 |
| Superellipse | 3.348 ms at 90×62 | 9.207 ms at 165×114 | 30.092 ms at 300×208 |

## Initial budgets and policy

- Low-quality generation target: less than 4 ms p95 on the reference host.
- Medium-quality generation target: less than 12 ms p95. Every final reference
  sample remained within this budget.
- High quality is not suitable for repeated main-thread regeneration at large
  sizes; use it for stable geometry, deferred work, or worker generation.
- Position-only movement must never regenerate a map.
- Resize interaction should use low quality and settle to medium/high after the
  geometry stabilizes.
- The bounded cache default is 8 MiB and uses least-recently-used eviction.

## Interpretation

Superellipse power operations are currently the most expensive geometry path.
The cache keeps this path off position-only movement, but a
lookup/approximation optimization remains a release-candidate follow-up for
large or frequently changing geometry.

## Browser reference probe

Run:

```bash
pnpm run bench:browser
```

The browser probe is deliberately isolated to Chromium on the reference host;
cross-browser functionality is tested separately.

| Metric                                 | 0.4.0 result (2026-09-29) |                      Research budget |
| -------------------------------------- | ------------------------: | -----------------------------------: |
| CSS material-state update p95          |                   17.7 ms |                             < 100 ms |
| WebGL2 frame interval median           |                   16.8 ms |                             recorded |
| WebGL2 frame interval p95              |                   48.6 ms |                              < 60 ms |
| Active-window longest task             |                     50 ms |                             < 100 ms |
| Surfaces after route teardown          |                         0 |                                    0 |
| Instrument videos after route teardown |                         0 |                                    0 |

0.3.0 recorded a 34.2 ms frame p95 on the same host. The 0.4.0 reading was
taken while other headless browser sessions shared the machine; an
interleaved A/B of the liquid and classic designs under forced software
rendering (SwiftShader) measured the same frame times for both, so the
difference is host load rather than the liquid design.

The two WebGL-window budgets (frame interval and active-window longest task)
are enforced on the reference host only. The release workflow's shared
two-core Linux runner rasterizes the WebGL refraction page in software at
about 180 ms a frame, and each such frame is itself a long task, for every
design and version. CI records both readings (`frameBudgetGated: false` in the
report) and still enforces input latency and resource teardown.

The headless software-backed result is acceptable for this research build but
must be retested on physical integrated and discrete GPUs before a performance
claim.

## Built output

Release-candidate package evidence was regenerated on 2026-07-25 after a clean
five-package build and offline packed-install test.

| Artifact                            |                 Verified size |
| ----------------------------------- | ----------------------------: |
| Public facade CSS-first root bundle |             18,743 B minified |
| Opt-in public WebGL subpath bundle  |             12,190 B minified |
| `signedDistance`-only facade import |              1,222 B minified |
| `open-glass-ui` tarball             |                      10,221 B |
| `@open-glass-ui/core` tarball       |                       7,834 B |
| `@open-glass-ui/renderers` tarball  |                       8,573 B |
| `@open-glass-ui/react` tarball      |                       9,528 B |
| `@open-glass-ui/recipes` tarball    |                      28,620 B |
| Showcase JavaScript                 | 312.48 KB raw / 95.18 KB gzip |
| Showcase CSS                        |  95.49 KB raw / 18.72 KB gzip |

The public root bundle contains zero eager WebGL inputs. A
`signedDistance`-only consumer still bundles to 1,222 bytes, confirming that
the side-effect-free implementation packages tree-shake through the facade.
Recipe CSS is intentionally declared as a side effect.

Machine-readable evidence:

- `artifacts/performance/optics.json`
- `artifacts/performance/chromium.json`
- `artifacts/packages/package-report.json`

These are reference-host baselines, not broad device claims.
