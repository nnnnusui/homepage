import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  ssr: false,
  server: {
    static: true,
    prerender: {
      crawlLinks: true,
    },
  },
});
