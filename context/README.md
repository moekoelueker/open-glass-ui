# OpenGlass UI Context Pack

This folder is the fast orientation layer for future maintainers and AI agents.
It is intentionally smaller than the full repository documentation.

## Recommended reading paths

### Any new session

1. [`../AGENTS.md`](../AGENTS.md)
2. [`../HANDOVER.md`](../HANDOVER.md)
3. [`CURRENT-STATE.md`](./CURRENT-STATE.md)

### Product or design work

1. [`PRODUCT-BRIEF.md`](./PRODUCT-BRIEF.md)
2. [`DECISIONS.md`](./DECISIONS.md)
3. [`FILE-MAP.md`](./FILE-MAP.md)

### Architecture or package work

1. [`ARCHITECTURE-MAP.md`](./ARCHITECTURE-MAP.md)
2. [`DECISIONS.md`](./DECISIONS.md)
3. [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
4. [`../docs/COMPONENTS.md`](../docs/COMPONENTS.md)

### Research or positioning work

1. [`RESEARCH-SUMMARY.md`](./RESEARCH-SUMMARY.md)
2. [`PRODUCT-BRIEF.md`](./PRODUCT-BRIEF.md)
3. [`../docs/RESEARCH.md`](../docs/RESEARCH.md)
4. [`../docs/EXPERIMENT-REPORT.md`](../docs/EXPERIMENT-REPORT.md)

### Launch preparation

1. [`CURRENT-STATE.md`](./CURRENT-STATE.md)
2. [`NEXT-STEPS.md`](./NEXT-STEPS.md)
3. [`../docs/RELEASE-CHECKLIST.md`](../docs/RELEASE-CHECKLIST.md)
4. [`../docs/LIMITATIONS.md`](../docs/LIMITATIONS.md)

## File purposes

| File | Answers |
| --- | --- |
| `PRODUCT-BRIEF.md` | Why does this exist, who is it for, and what should it feel like? |
| `RESEARCH-SUMMARY.md` | What was studied and what evidence shaped the system? |
| `DECISIONS.md` | Which decisions are settled, why, and what are their consequences? |
| `ARCHITECTURE-MAP.md` | How does the runtime and package system fit together? |
| `FILE-MAP.md` | Where should a specific kind of change be made? |
| `CURRENT-STATE.md` | What is complete, validated, blocked, or unpublished right now? |
| `NEXT-STEPS.md` | What should happen next, in what order? |
| `HANDOVER-PROMPT.md` | What prompt can be pasted into another AI session? |

## Truth hierarchy

Use this order when information appears inconsistent:

1. Current source and tests.
2. Package manifests and generated declarations.
3. Topic documentation under `docs/`.
4. `HANDOVER.md` and this context pack.
5. Historical planning and screenshot evidence.

Historical research is valuable for rationale but must not override the current
CSS-first product contract.

## Maintenance rule

Update this pack in the same commit when any of these change:

- Product identity or audience.
- Public package/API surface.
- Renderer selection policy.
- Theme or accessibility contract.
- Route purposes.
- Component inventory.
- Validation totals or release posture.
- Publication authorization or external URLs.
- Priority roadmap.

Avoid copying complete API references into this folder. Link to the canonical
topic document and capture only the decision or orientation needed for pickup.
