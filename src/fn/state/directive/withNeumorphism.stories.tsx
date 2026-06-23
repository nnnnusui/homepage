import { onMount, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { Wve } from "~/type/struct/Wve";
import { withNeumorphism } from "./withNeumorphism";

const Neumorphisms = () => {
  const pointerPos = Wve.create({ x: 0, y: 0 });
  const updateAngleFromPointer = (
    e: PointerEvent,
  ) => {
    pointerPos.set({ x: e.clientX, y: e.clientY });
  };

  onMount(() => {
    window.addEventListener("pointermove", updateAngleFromPointer);
    return () => {
      window.removeEventListener("pointermove", updateAngleFromPointer);
    };
  });

  return (
    <div class="size-full flex items-center gap-8">
      <For each={["flat", "concave", "convex", "pressed"] as const}>{(shape) => (
        <div
          class={cn("size-40 flex justify-center items-center")}
          ref={chainUseRef([
            withNeumorphism(() => ({
              get shape() { return shape; },
              get light() { return pointerPos(); },
            })),
          ])}
        >
          {shape}
        </div>
      )}</For>
    </div>
  );
};
const meta = {
  title: "theme/Neumorphism",
  component: Neumorphisms,
  args: {
  },
} satisfies Meta<typeof Neumorphisms>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  },
};

export const Light: Story = {
  args: {
  },
  parameters: {
    darkMode: false,
  },
};
