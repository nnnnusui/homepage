import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Envelope } from ".";

const meta = {
  component: () => (
    <div class="flex flex-col items-center justify-start gap-6 p-4 w-full">
      <Envelope>
        <Envelope.View />
        <Envelope.Editor />
      </Envelope>
    </div>
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
