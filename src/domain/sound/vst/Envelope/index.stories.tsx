import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Envelope } from ".";

const meta = {
  component: () => (
    <Envelope class="relative w-full flex flex-col gap-4 overflow-hidden p-1">
      <Envelope.View>
        <Envelope.Scaler class="absolute top-0 right-0" />
        <Envelope.Anchor.All />
      </Envelope.View>
      <section class="flex flex-col gap-4 w-full rounded-lg border border-slate-700/70 p-4">
        <header>
          <h2 class="text-base font-semibold text-slate-100">Envelope Editor</h2>
          <p class="text-sm text-slate-300">Adjust delay, attack, hold, decay, sustain, and release.</p>
        </header>
        <Envelope.Knob.All />
      </section>
    </Envelope>
  ),
  parameters: {
  },
  args: {
  },
} satisfies Meta<typeof Envelope>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
