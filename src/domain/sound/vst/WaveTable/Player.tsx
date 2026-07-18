import { onMount } from "solid-js";

import { useAudioEnvironment } from "~/fn/state/root/useAudioEnvironment";
import { Wve } from "~/type/struct/Wve";
import { useWaveTableContext } from "./createWaveTable";

export const Player = () => {
  const context = useWaveTableContext();
  const state = Wve.from(() => context.state);
  const audioEnv = useAudioEnvironment();

  let gainNode: GainNode | null = null;
  onMount(() => {
    audioEnv.useContext(async ({ context: audioContext, connectFrom }) => {
      gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      connectFrom(
        (await context.node.ready)
          .connect(gainNode),
      );
    });
  });

  const start = () => {
    if (!gainNode) return;
    state.set("isPlaying", true);
    const t = audioEnv.context.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.linearRampToValueAtTime(1, t + 0.03);
  };

  const stop = () => {
    state.set("isPlaying", false);
    if (!gainNode) return;
    const t = audioEnv.context.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.linearRampToValueAtTime(0, t + 0.03);
  };

  return (
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-colors"
        onClick={() => void (state().isPlaying ? stop() : start())}
      >
        {state().isPlaying ? "Stop" : "Play"}
      </button>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-300">Morph ({state().currentMorphRatio.toFixed(2)})</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={state().currentMorphRatio}
          onInput={(e) => state.set("currentMorphRatio", Number(e.currentTarget.value))}
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-300">Frequency ({state().frequency.toFixed(1)} Hz)</span>
        <input
          type="range"
          min="40"
          max="880"
          step="0.1"
          value={state().frequency}
          onInput={(e) => state.set("frequency", Number(e.currentTarget.value))}
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-300">Gain ({state().gain.toFixed(2)})</span>
        <input
          type="range"
          min="0"
          max="0.3"
          step="0.001"
          value={state().gain}
          onInput={(e) => state.set("gain", Number(e.currentTarget.value))}
        />
      </label>
    </div>
  );
};
