import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
    ],
  },
  ssr: false,
  server: {
    static: true,
    prerender: {
      crawlLinks: true,
    },
  },
});
