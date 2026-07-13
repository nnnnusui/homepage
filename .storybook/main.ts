import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "storybook-solidjs-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "storybook-solidjs-vite",
    options: {
      docgen: {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop) =>
          prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      },
    },
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        tailwindcss(),
      ],
      resolve: {
        ...(config.resolve ?? {}),
        tsconfigPaths: true,
      },
    };
  },
};
export default config;
