import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For local dev, base="/" is perfect.
// Later for GitHub Pages we'll change base to "/<your-repo-name>/"
export default defineConfig({
  plugins: [react()],
  base: "/"
});
