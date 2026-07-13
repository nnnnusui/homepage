import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: "unit",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
