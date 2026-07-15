import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Resizable } from "~/components/foundation/render/Resizable";

import { WaveTable } from ".";

const meta = {
  component: () => (
    <div class="flex flex-col items-center justify-start gap-8 p-4">
      <WaveTable>
        <Resizable resizable={["bottom"]} class="w-full">
          <WaveTable.View3D />
        </Resizable>
        <Resizable resizable={["bottom", "left", "right"]}>
          <WaveTable.View2D />
        </Resizable>
        <WaveTable.Player />
        <WaveTable.Editor />
      </WaveTable>
    </div>
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
