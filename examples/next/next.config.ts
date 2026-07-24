import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@prism-lab/core", "@prism-lab/renderers", "@prism-lab/react"],
};

export default config;
