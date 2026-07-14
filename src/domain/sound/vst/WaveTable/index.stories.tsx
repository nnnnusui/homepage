import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { WaveTable } from ".";

const meta = {
  component: () => (
    <WaveTable>
      <WaveTable.View3D />
      <WaveTable.Player />
    </WaveTable>
  ),
  parameters: {
  },
  args: {
  },
} satisfies Meta<typeof WaveTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
