import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ButtonStyled } from "./ButtonStyled";

const meta = {
  component: ButtonStyled,
  args: {
    children: "any element",
  },
} satisfies Meta<typeof ButtonStyled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};
