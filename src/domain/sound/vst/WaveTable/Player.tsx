import { Wve } from "~/type/struct/Wve";
import { useWaveTableContext } from "./createWaveTable";
import { createWaveTableSynth } from "./createWaveTableSynth";

export const Player = () => {
  const context = useWaveTableContext();
  const state = Wve.from(() => context.state);
  const synth = createWaveTableSynth({
    get frequency() { return state().frequency; },
    get morph() { return state().currentMorphRatio; },
    get gain() { return state().gain; },
    get waveTableInstance() { return context.instance.samples; },
    get frameCount() { return context.instance.frameCount; },
    get tableSize() { return context.instance.tableSize; },
  });

  const start = () => {
    state.set("isPlaying", true);
    synth.start();
  };

  const stop = () => {
    state.set("isPlaying", false);
    synth.stop();
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
