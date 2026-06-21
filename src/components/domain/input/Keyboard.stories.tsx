import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Keyboard } from "./Keyboard";

const meta = {
  component: Keyboard,
  args: {
  },
} satisfies Meta<typeof Keyboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
