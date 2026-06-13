import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import happyCssModules from "vite-plugin-happy-css-modules";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
      happyCssModules({ pattern: "src/**/*.module.{css,scss,less}" }),
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
