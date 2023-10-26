import { StoryObj, Meta } from "storybook-solidjs";

import { ModeSelector } from ".";

const meta: Meta<typeof ModeSelector> = {
  component: ModeSelector,
};

export default meta;
type Story = StoryObj<typeof ModeSelector>;

export const Default: Story = {
};
