import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Envelope } from ".";

const meta = {
  component: () => (
    <Envelope class="relative w-full">
      <div class="w-full overflow-hidden">
        <Envelope.View />
        <Envelope.Scaler class="absolute top-0 right-0" />
      </div>
      <Envelope.Editor />
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
