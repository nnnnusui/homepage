import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Knob } from "./Knob";
import { Resizable } from "../render/Resizable";

const meta = {
  component: Knob,
  decorators: [
    (Story) => (
      <Resizable class="h-min">
        <Story />
      </Resizable>
    ),
  ],
  parameters: {
  },
  args: {
  },
} satisfies Meta<typeof Knob>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
