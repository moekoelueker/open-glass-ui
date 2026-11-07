---
"open-glass-ui": patch
---

Importing one component no longer bundles the others. Bundlers drop an unused
export only when they can prove it has no side effects, and the top-level
`forwardRef(...)` calls carried no `@__PURE__` annotation, so every
`forwardRef` component stayed in every bundle. 0.5.0 added `forwardRef` to
eleven recipes, and `import { Button } from "open-glass-ui"` grew to 28.7 KB
minified (React external). All fifteen top-level `forwardRef` calls are now
annotated, and the liquid material's muted ink is built on call instead of in a
module-level template literal. Button alone now bundles to about 2 KB. Runtime
behavior is unchanged.
