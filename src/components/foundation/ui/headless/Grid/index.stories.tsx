import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { Grid } from ".";

const InfiniteCanvs = () => {
  return (
    <Grid origin="center-left"
      virtualPadding={{ top: 100, right: 1000, bottom: 100, left: 0 }}
    >
      <Grid.Viewport>
        <Grid.Background />
        <Grid.Content pos={{ x: 1, y: 0 }} size={{ width: 1, height: 1 }} class="bg-amber-400" />
      </Grid.Viewport>
      <Grid.Header area="bottom-center">
        <Grid.Content pos={{ x: 0, y: 0 }} size={{ width: 1, height: 1 }} class="bg-amber-400" />
      </Grid.Header>
      <Grid.Header area="left">
        <Grid.Content pos={{ x: 0, y: 0 }} size={{ width: 1, height: 1 }} class="bg-amber-400" />
      </Grid.Header>
    </Grid>
  );
};

const meta = {
  component: InfiniteCanvs,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof InfiniteCanvs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
