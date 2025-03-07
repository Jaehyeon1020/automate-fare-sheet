import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "port-0-automate-fare-sheet-m7yajxat795b213e.sel4.cloudtype.app",
    ],
  },
});
