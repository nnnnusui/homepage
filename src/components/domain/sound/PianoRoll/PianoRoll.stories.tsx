import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { PianoRoll } from ".";

const meta = {
  component: PianoRoll,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PianoRoll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
