import { Button, Glass, GlassSystemProvider } from "open-glass-ui";

export function GlassProbe() {
  return (
    <GlassSystemProvider theme={{ appearance: "system", theme: { preset: "neutral" } }}>
      <Glass material="regular">
        OpenGlass UI SSR fixture
        <Button variant="primary">Continue</Button>
      </Glass>
    </GlassSystemProvider>
  );
}
