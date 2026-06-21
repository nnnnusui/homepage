import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { KeyboardVisibilityToggleButton } from "./KeyboardVisibilityToggleButton";

const meta = {
  component: KeyboardVisibilityToggleButton,
  args: {
  },
} satisfies Meta<typeof KeyboardVisibilityToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
