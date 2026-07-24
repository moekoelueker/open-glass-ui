import { GlassProvider } from "@prism-lab/react";
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
      <App />
    </GlassProvider>
  </StrictMode>,
);
