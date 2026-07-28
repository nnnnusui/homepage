import { createEffect , onCleanup, onMount, Show } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { SliderStyled } from "~/components/foundation/ui/SliderStyled";
import { createThrottleParAnimationFrame } from "~/fn/state/createThrottleParAnimationFrame";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";

const Neumorphisms = () => {
  const state = Wve.create({
    pointerPos: { x: 0, y: 0 },
    lightParamsDisabled: false,
    depth: 0.4,
    clarity: 0.6,
  });

  onMount(() => {
    const updateAngleFromPointer = (e: PointerEvent) => state.set("pointerPos", { x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", updateAngleFromPointer);
    return () => {
      window.removeEventListener("pointermove", updateAngleFromPointer);
    };
  });

  const withLightParams = getWithLightParams(() => state().pointerPos, () => state().lightParamsDisabled);

  return (
    <div class="size-full flex flex-col justify-center items-center gap-8"
      style={{
        "--neumo-depth": state().depth,
        "--neumo-clarity": state().clarity,
      }}
    >
      <div class="flex flex-col items-center gap-16">
        <div class="flex items-center gap-8">
          <div ref={withLightParams} class="neumo-bump size-50 rounded-lg flex justify-center items-center">neumo-bump</div>
          <div ref={withLightParams} class="neumo-bump-concave size-50 rounded-lg flex justify-center items-center">neumo-bump-concave</div>
          <div ref={withLightParams} class="neumo-bump-convex size-50 rounded-lg flex justify-center items-center">neumo-bump-convex</div>
        </div>
        <div class="flex items-center gap-8">
          <div ref={withLightParams} class="neumo-dent size-50 rounded-lg flex justify-center items-center">neumo-dent</div>
          <div ref={withLightParams} class="neumo-dent-concave size-50 rounded-lg flex justify-center items-center">neumo-dent-concave</div>
          <div ref={withLightParams} class="neumo-dent-convex size-50 rounded-lg flex justify-center items-center">neumo-dent-convex</div>
        </div>
      </div>
      <div class="flex items-center gap-8">
        depth:
        <SliderStyled value={state().depth}
          onPreview={(value) => state.set("depth", value)}
          min={0}
          max={1}
          step={0.01}
        />
        clearity:
        <SliderStyled value={state().clarity}
          onPreview={(value) => state.set("clarity", value)}
          min={0}
          max={1}
          step={0.01}
        />
        <label>
          <Show when={state().lightParamsDisabled} fallback={<span class="text-green-500">light params enabled</span>}>
            <span class="text-red-500">light params disabled</span>
          </Show>
          <input type="checkbox"
            checked={state().lightParamsDisabled}
            onChange={(e) => state.set("lightParamsDisabled", e.currentTarget.checked)}
          />
        </label>
      </div>
    </div>
  );
};

const getWithLightParams = (lightSourcePos: () => Pos, lightParamsDisabled: () => boolean) => (element: HTMLElement) => {
  const update = createThrottleParAnimationFrame(() => () => {
    if (lightParamsDisabled()) return cleanStyle();
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = lightSourcePos().x - centerX;
    const dy = lightSourcePos().y - centerY;
    const angle = (
      Math.atan2(dy, dx)
      * 180
      / Math.PI
      + 360
    ) % 360;
    const distance = Math.hypot(dx, dy);
    const maxDistance = Math.hypot(rect.width / 2, rect.height / 2);
    const proximity = Math.max(0, Math.min(1, 1 - distance / maxDistance));
    const overElement = (
      lightSourcePos().x >= rect.left
      && lightSourcePos().x <= rect.right
      && lightSourcePos().y >= rect.top
      && lightSourcePos().y <= rect.bottom
    );
    const elevation = overElement
      ? 0.2 + (1 - proximity) * 0.6
      : 0.8;
    element.style.setProperty("--neumo-light-azimuth", `${angle}`);
    element.style.setProperty("--neumo-light-proximity", `${proximity}`);
    element.style.setProperty("--neumo-light-elevation", `${elevation}`);
  });
  const cleanStyle = () => {
    element.style.removeProperty("--neumo-light-azimuth");
    element.style.removeProperty("--neumo-light-proximity");
    element.style.removeProperty("--neumo-light-elevation");
  };
  createEffect(() => {
    void Wve.track(lightSourcePos());
    void lightParamsDisabled();
    update.run();
  });
  onCleanup(cleanStyle);
};

const meta = {
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
