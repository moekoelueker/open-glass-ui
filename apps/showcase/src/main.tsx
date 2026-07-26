import { GlassProvider, GlassThemeProvider } from "@open-glass-ui/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root");
}

createRoot(root).render(
  <StrictMode>
    <GlassProvider renderer="auto" quality="auto" motion="system">
      <GlassThemeProvider appearance="system" theme={{ preset: "neutral", contrast: "high" }}>
        <App />
      </GlassThemeProvider>
    </GlassProvider>
  </StrictMode>,
);
