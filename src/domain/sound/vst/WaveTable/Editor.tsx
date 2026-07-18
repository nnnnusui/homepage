import { For } from "solid-js";

import { Knob } from "~/components/foundation/ui/Knob";
import { Objects } from "~/fn/objects";
import { createThrottleParAnimationFrame } from "~/fn/state/createThrottleParAnimationFrame";
import { Wve } from "~/type/struct/Wve";
import { EasingDefinition, useWaveTableContext, WaveShapeDefinition, WaveTableDefinition, WaveTableKeyframe } from "./createWaveTable";

/** @public */
export const Editor = () => {
  const context = useWaveTableContext();
  const state = Wve.from(() => context.state);
  const definition = state.partial("definition");

  const commitOffset = (id: typeof WaveTableDefinition.KeyframeId.type, value: number) => {
    definition.set(
      "keyframes",
      (frame) => frame.id === id,
      "offset",
      clamp(value, 0, 1),
    );
  };

  const throttledOffsetUpdate = createThrottleParAnimationFrame(
    (id: typeof WaveTableDefinition.KeyframeId.type, value: number) =>
      () => commitOffset(id, value),
  );

  const addKeyframe = () => {
    definition.set("keyframes", (prev) => [
      ...prev,
      {
        id: WaveTableDefinition.KeyframeId.generate(),
        offset: 0.5,
        shape: { type: "builtin", id: "sine" },
        easing: undefined,
      },
    ]);
  };

  const removeKeyframe = (id: typeof WaveTableDefinition.KeyframeId.type) => {
    if (definition().keyframes.length <= 2) return;
    definition.set("keyframes", (prev) => prev.filter((keyframe) => keyframe.id !== id));
  };

  return (
    <section class="flex flex-col gap-4 w-full">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3" />

      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Keyframes</h2>
        <div class="flex gap-6 items-center">
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-sm text-slate-300">Frame Count</span>
            <input
              type="number"
              min="1"
              value={context.instance.frameCount}
              // onInput={(e) => state.set("frameCount", Number(e.currentTarget.value || 1))}
              disabled
            />
          </label>

          <label class="flex flex-col gap-1 text-xs">
            <span class="text-sm text-slate-300">Table Size</span>
            <input
              type="number"
              min="1"
              step="1"
              value={context.instance.tableSize}
              // onInput={(e) => state.set("tableSize", Number(e.currentTarget.value || 1))}
              disabled
            />
          </label>
          <Knob
            min={0}
            max={1}
            step={0.001}
            onInput={(value) => state.set("currentMorphRatio", value)}
          >
            Morph
          </Knob>
          <label class="flex flex-col gap-1">
            <span class="text-sm text-slate-300">Default Easing</span>
            <select
              value={definition().defaultEasing.id}
              onInput={(e) => definition.set("defaultEasing", { type: "builtin", id: e.currentTarget.value as keyof typeof EasingDefinition.builtinMap })}
            >
              <For each={Objects.keys(EasingDefinition.builtinMap)}>{(easing) => (
                <option value={easing}>{easing}</option>
              )}</For>
            </select>
          </label>
          <button
            type="button"
            class="px-3 py-1.5 rounded-md bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-colors"
            onClick={addKeyframe}
          >
            Add Keyframe
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <For each={[...definition().keyframes].sort((a, b) => a.offset - b.offset)}>
          {(keyframe) => (
            <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-md border border-slate-700/60 p-2">
              <label class="flex flex-col gap-1">
                <span class="text-xs text-slate-300">Offset ({keyframe.offset.toFixed(3)})</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={keyframe.offset}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    throttledOffsetUpdate.run(keyframe.id, value);
                  }}
                  onChange={(e) => {
                    const value = Number(e.currentTarget.value);
                    throttledOffsetUpdate.cancel();
                    commitOffset(keyframe.id, value);
                  }}
                />
              </label>

              <label class="flex flex-col gap-1">
                <span class="text-xs text-slate-300">Shape</span>
                <select
                  value={keyframe.shape.id}
                  onInput={(e) => {
                    definition.set(
                      "keyframes",
                      (frame) => frame.id === keyframe.id,
                      "shape",
                      { type: "builtin", id: e.currentTarget.value as keyof typeof WaveShapeDefinition.builtinMap },
                    );
                  }}
                >
                  <For each={Objects.keys(WaveShapeDefinition.builtinMap)}>{(shape) => (
                    <option value={shape}>{shape}</option>
                  )}</For>
                </select>
              </label>

              <label class="flex flex-col gap-1">
                <span class="text-xs text-slate-300">Segment Easing</span>
                <select
                  value={keyframe.easing?.id}
                  onInput={(e) => {
                    const next: WaveTableKeyframe["easing"]
                      = e.currentTarget.value === ""
                        ? undefined
                        : { type: "builtin", id: e.currentTarget.value as keyof typeof EasingDefinition.builtinMap };
                    definition.set(
                      "keyframes",
                      (frame) => frame.id === keyframe.id,
                      "easing",
                      next,
                    );
                  }}
                >
                  <option value="">Default</option>
                  <For each={Objects.keys(EasingDefinition.builtinMap)}>{(easing) => (
                    <option value={easing}>{easing}</option>
                  )}</For>
                </select>
              </label>

              <button
                type="button"
                class="px-3 py-1.5 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors disabled:opacity-50"
                disabled={definition().keyframes.length <= 2}
                onClick={() => removeKeyframe(keyframe.id)}
              >
                Remove
              </button>
            </div>
          )}
        </For>
      </div>
    </section>
  );
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
