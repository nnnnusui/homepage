import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Button } from ".";

const meta = {
  component: Button,
  args: {
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    class: "size-100 bg-yellow-300",
  },
};
