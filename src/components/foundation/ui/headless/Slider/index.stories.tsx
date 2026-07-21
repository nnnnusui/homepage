import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Slider } from ".";

const meta = {
  component: () => (
    <Slider class="w-80 h-10 flex flex-col items-center justify-center gap-2">
      <Slider.ValueText class="left-1/2 -translate-x-1/2 text-sm font-medium text-gray-700" />
      <Slider.Track class="relative w-full h-1 bg-gray-300 rounded">
        <Slider.Range class="absolute h-full bg-amber-500 rounded" />
        <Slider.Thumb class="top-1/2 left-(--slider-progress) -translate-1/2 size-2 bg-amber-500 rounded-full" />
      </Slider.Track>
    </Slider>
  ),
  parameters: {
  },
  args: {
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
