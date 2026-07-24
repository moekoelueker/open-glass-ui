# Performance Baseline

Measured: 2026-07-24

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

| Shape | Low p95 | Medium p95 | High p95 |
| --- | ---: | ---: | ---: |
| Circle | 2.024 ms at 72×72 | 4.727 ms at 132×132 | 13.951 ms at 240×240 |
| Capsule | 1.606 ms at 96×38 | 4.355 ms at 176×70 | 14.467 ms at 320×128 |
| Rounded rect | 2.271 ms at 96×62 | 19.792 ms at 176×114 | 22.904 ms at 320×208 |
| Superellipse | 3.974 ms at 90×62 | 11.859 ms at 165×114 | 34.796 ms at 300×208 |

## Initial budgets and policy

- Low-quality generation target: less than 4 ms p95 on the reference host.
- Medium-quality generation target: less than 12 ms p95. One rounded-rectangle
  sample exceeded this target and is retained as an honest outlier.
- High quality is not suitable for repeated main-thread regeneration at large
  sizes; use it for stable geometry, deferred work, or worker generation.
- Position-only movement must never regenerate a map.
- Resize interaction should use low quality and settle to medium/high after the
  geometry stabilizes.
- The bounded cache default is 8 MiB and uses least-recently-used eviction.

## Interpretation

Superellipse power operations are currently the most expensive geometry path.
This is acceptable for the research prototype because maps are cached, but a
lookup/approximation optimization is a post-visual-validation candidate.

## Browser reference probe

Run:

```bash
pnpm run bench:browser
```

The browser probe is deliberately isolated to Chromium on the reference host;
cross-browser functionality is tested separately.

| Metric | Result | Research budget |
| --- | ---: | ---: |
| CSS material-state update p95 | 18.5 ms | < 100 ms |
| WebGL2 frame interval median | 18.5 ms | recorded |
| WebGL2 frame interval p95 | 33.4 ms | < 60 ms |
| Active-window longest task | 0 ms observed | < 100 ms |
| Cold development startup longest task | 448 ms | recorded, not approved as production |
| Surfaces after route teardown | 0 | 0 |
| Instrument videos after route teardown | 0 | 0 |

The headless software-backed result is acceptable for this research build but
must be retested on physical integrated and discrete GPUs before a performance
claim.

## Built output

| Artifact | Raw | Gzip / packed |
| --- | ---: | ---: |
| `@prism-lab/core` ESM | 12.60 KB | 5,006 B tarball |
| `@prism-lab/renderers` ESM | 21.63 KB | 8,081 B tarball |
| `@prism-lab/react` ESM | 23.88 KB | 8,093 B tarball |
| `@prism-lab/recipes` ESM | 14.90 KB | 8,505 B tarball |
| Showcase JavaScript | 258.67 KB | 80.68 KB gzip |
| Showcase CSS | 44.12 KB | 10.14 KB gzip |

A `signedDistance`-only consumer bundles to 1,222 bytes minified, confirming
that the side-effect-free core can tree-shake. Recipe CSS is intentionally
declared as a side effect.

Machine-readable evidence:

- `artifacts/performance/optics.json`
- `artifacts/performance/chromium.json`
- `artifacts/packages/package-report.json`

These are reference-host baselines, not broad device claims.
