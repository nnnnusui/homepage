import { MetaProvider, Style } from "@solidjs/meta";
import { onMount } from "solid-js";
import { DecoratorFunction } from "storybook/internal/csf";
import { themes } from "storybook/theming";
import type { Preview, SolidRenderer } from "storybook-solidjs-vite";

import { useInStorybook } from "~/fn/state/root/useInStorybook";
import { useTheme } from "~/fn/state/root/useTheme";

// @ts-expect-error: style import
import "~/app.css";
// @ts-expect-error: style import
import "~/app.styl";
// @ts-expect-error: style import
import "./preview.css";

useInStorybook().set(true);
const detectThemeChange = (): DecoratorFunction<SolidRenderer, unknown> => {
  return (Story, context) => {
    const theme = useTheme();
    let ref: HTMLDivElement | undefined;
    onMount(() => {
      if (!ref) return;
      if (context.viewMode == "docs") {
        ref.closest(".docs-story")?.classList.toggle("light", !context.parameters.darkMode);
        ref.closest(".docs-story")?.classList.toggle("dark", context.parameters.darkMode);
      } else {
        ref.closest("body")?.classList.toggle("light", !context.parameters.darkMode);
        ref.closest("body")?.classList.toggle("dark", context.parameters.darkMode);
      }
    });

    const size = () => {
      if (context.parameters.layout === "fullscreen") {
        return { width: "100%", height: "100%", ["min-height"]: "200px" };
      } else if (context.parameters.layout === "centered") {
        return { ["justify-content"]: "center", ["align-items"]: "center", height: "100%" };
      }
    };

    return (
      <MetaProvider>
        <Style>{theme.style}</Style>
        <div ref={ref} class="grid" style={size()}>
          <Story />
        </div>
      </MetaProvider>
    );
  };
};

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    docs: {
      theme: themes.dark,
    },
    backgrounds: {
      disable: true,
    },
    darkMode: true,
  },
  tags: ["autodocs"],
  decorators: [
    detectThemeChange(),
  ],
};

export default preview;
