"use client";

import { Glass, GlassProvider } from "@prism-lab/react";

export function GlassProbe() {
  return (
    <GlassProvider>
      <Glass material="regular">Prism Lab SSR fixture</Glass>
    </GlassProvider>
  );
}
