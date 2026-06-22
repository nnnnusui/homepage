import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Resizable } from "./Resizable";

const meta = {
  component: Resizable,
  args: {
  },
  decorators: [
    (Story) => (
      <div class="size-50 flex items-center justify-center bg-gray-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Resizable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (<div class="size-full bg-yellow-300" />),
    resizable: ["top", "left", "right", "bottom"],
    disabled: false,
  },
};
