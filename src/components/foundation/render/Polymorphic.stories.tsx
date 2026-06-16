import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Polymorphic } from "./Polymorphic";

const meta = {
  component: Polymorphic,
  args: {
  },
} satisfies Meta<typeof Polymorphic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    as: "div",
    class: "size-10 bg-yellow-300",
  },
};
