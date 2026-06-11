import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { PageTitle } from "./PageTitle";

const meta = {
  component: PageTitle,
  args: {
    children: "Page Title",
  },
} satisfies Meta<typeof PageTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
