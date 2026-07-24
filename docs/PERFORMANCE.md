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
| Circle | 1.89 ms at 72×72 | 4.26 ms at 132×132 | 22.49 ms at 240×240 |
| Capsule | 1.67 ms at 96×38 | 4.38 ms at 176×70 | 14.44 ms at 320×128 |
| Rounded rect | 2.06 ms at 96×62 | 7.10 ms at 176×114 | 21.55 ms at 320×208 |
| Superellipse | 3.46 ms at 90×62 | 10.65 ms at 165×114 | 30.72 ms at 300×208 |

## Initial budgets and policy

- Low-quality generation target: less than 4 ms p95 on the reference host.
- Medium-quality generation target: less than 12 ms p95.
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

These numbers are a baseline, not a broad device claim. Browser, mobile, WebGL,
input responsiveness, memory, and cleanup measurements remain required.

