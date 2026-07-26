import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: [
    "open-glass-ui",
    "@open-glass-ui/core",
    "@open-glass-ui/renderers",
    "@open-glass-ui/react",
    "@open-glass-ui/recipes",
  ],
};

export default config;
