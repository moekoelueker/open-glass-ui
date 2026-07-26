# @open-glass-ui/core

Framework-independent geometry, optical material, capability, and adaptive
theme utilities for OpenGlass UI.

Consumers should install the `open-glass-ui` facade. Server code, build tooling,
and non-React adapters can use its public `open-glass-ui/core` subpath for pure
utilities without a client boundary. This scoped package is dependency-chain
infrastructure rather than the supported consumer entry point.

```ts
import { createGlassTheme, signedDistance } from "open-glass-ui/core";
```

MIT licensed. OpenGlass UI is independent and is not affiliated with Apple.
