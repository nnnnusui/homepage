import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { KeyboardKey } from "./KeyboardKey";

const meta = {
  component: KeyboardKey,
  args: {
  },
} satisfies Meta<typeof KeyboardKey>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "A",
  },
};

export const Tab: Story = {
  args: {
    label: "Tab",
  },
};
