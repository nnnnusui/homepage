import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { PianoRollNote } from "./PianoRollNote";

const meta = {
  component: PianoRollNote,
  args: {
  },
} satisfies Meta<typeof PianoRollNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
