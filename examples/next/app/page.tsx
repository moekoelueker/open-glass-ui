import { contrastRatio } from "open-glass-ui/core";
import { GlassProbe } from "./glass-probe";

export default function Page() {
  const neutralContrast = contrastRatio("#f4f3ee", "#101214").toFixed(1);

  return (
    <main>
      <p>Server-safe neutral contrast: {neutralContrast}:1</p>
      <GlassProbe />
    </main>
  );
}
