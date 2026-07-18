import { createSignal } from "solid-js";
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Piano } from "./Piano";

const meta = {
  component: Piano,
  args: {
    activeNotes: {},
  },
} satisfies Meta<typeof Piano>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onNoteOn: fn(),
    onNoteOff: fn(),
  },
};

export const Playiable: Story = {
  decorators: [
    (Story) => {
      return (
        <div class="rotate-90">
          <Story />
        </div>
      );
    },
    (Story) => {
      const [activeNotes, setActiveNotes] = createSignal<Record<number, number>>({});

      const handleNoteOn = (note: number) => {
        setActiveNotes((prev) => ({ ...prev, [note]: 100 }));
      };

      const handleNoteOff = (note: number) => {
        setActiveNotes((prev) => ({ ...prev, [note]: 0 }));
      };

      return (
        <Story
          args={{
            get activeNotes() {
              return activeNotes();
            },
            onNoteOn: handleNoteOn,
            onNoteOff: handleNoteOff,
          }}
        />
      );
    },
  ],
};
