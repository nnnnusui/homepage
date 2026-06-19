import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ToggleDarkMode } from "./ToggleDarkMode";

const meta = {
  component: ToggleDarkMode,
  args: {
  },
} satisfies Meta<typeof ToggleDarkMode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
