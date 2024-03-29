import solid from "solid-start/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    solid({
      adapter: "solid-start-static",
    }),
    tsconfigPaths(),
  ],
});
