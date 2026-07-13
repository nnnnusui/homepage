import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import happyCssModules from "vite-plugin-happy-css-modules";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      happyCssModules({ pattern: "src/**/*.module.{css,scss,less}" }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  },
  ssr: false,
  server: {
    static: true,
    prerender: {
      crawlLinks: true,
    },
  },
});
