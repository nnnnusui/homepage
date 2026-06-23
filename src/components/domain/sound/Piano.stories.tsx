import { fn } from "storybook/test";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Piano } from "./Piano";

const meta = {
  component: Piano,
  args: {
    activeNotes: {},
    onNoteOn: fn(),
    onNoteOff: fn(),
  },
} satisfies Meta<typeof Piano>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
