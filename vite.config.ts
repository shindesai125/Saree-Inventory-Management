import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    // regex-based alias for "@/" imports to reliably resolve on Windows and other platforms
    alias: [
      { find: /^@\//, replacement: path.resolve(__dirname, "src") + "/" },
    ],
  },
}));
