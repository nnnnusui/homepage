import { fn } from "storybook/test";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { DragDetector } from "./DragDetector";

const meta = {
  component: DragDetector,
  args: {
    onDrag: fn,
  },
} satisfies Meta<typeof DragDetector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Drag me",
  },
};
