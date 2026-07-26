# Contributing

OpenGlass UI is currently an owner-directed release candidate. Contributions
are welcome during pre-`1.0` stabilization once the public repository is
available; expect the API to keep evolving until `1.0.0`.

## Local checks

1. Install with `pnpm install`.
2. Run `pnpm run check`.
3. Run `pnpm run typecheck`.
4. Run `pnpm run test:unit`.
5. Run `pnpm run build`.
6. For visual work, run `pnpm run test:e2e` and inspect screenshots.

## Change rules

- Keep changes focused and explain renderer/browser implications.
- Add tests for optical math, capability policy, and public behavior.
- Include accessible fallback behavior for visual effects.
- Do not introduce code or assets without a verified compatible license.
- Update `CREDITS.md` for direct adaptations.
- Avoid render-time access to browser globals.
