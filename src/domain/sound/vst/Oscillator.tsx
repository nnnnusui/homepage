import { createEffect, onCleanup, onMount } from "solid-js";

import { createWavetableDraw } from "~/domain/sound/vst/createWavetableDraw";
import { Wve } from "~/type/struct/Wve";

const TABLE_SIZE = 2048;
const FRAME_COUNT = 64;

export const Oscillator = () => {
  const state = Wve.create({
    isPlaying: false,
    frequency: 110,
    morph: 0,
    gain: 0.12,
    phaseShift: 0,
  });

  const morphTables = createMorphTables({ frameCount: FRAME_COUNT, tableSize: TABLE_SIZE });
  const flatTables = flattenTables(morphTables);

  let canvasRef: HTMLCanvasElement | undefined;
  let audioContext: AudioContext | null = null;
  let workletNode: AudioWorkletNode | null = null;
  let gainNode: GainNode | null = null;
  let analyserNode: AnalyserNode | null = null;
  let rafId: number | null = null;
  let workletModuleUrl: string | null = null;

  const postSynthParams = () => {
    if (!workletNode) return;
    workletNode.port.postMessage({ kind: "setFrequency", value: state().frequency });
    workletNode.port.postMessage({ kind: "setMorph", value: state().morph });
    workletNode.port.postMessage({ kind: "setGain", value: state().gain });
  };

  const ensureContext = async () => {
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();
    return audioContext;
  };

  const start = async () => {
    if (state().isPlaying) return;
    const ctx = await ensureContext();

    if (!workletNode) {
      if (!workletModuleUrl) {
        const source = createWorkletModuleSource();
        const blob = new Blob([source], { type: "application/javascript" });
        workletModuleUrl = URL.createObjectURL(blob);
      }

      await ctx.audioWorklet.addModule(workletModuleUrl);

      analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 2048;

      gainNode = ctx.createGain();
      gainNode.gain.value = state().gain;

      workletNode = new AudioWorkletNode(ctx, "wavetable-morph-processor", {
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
          tables: flatTables,
          frameCount: FRAME_COUNT,
          tableSize: TABLE_SIZE,
          frequency: state().frequency,
          morph: state().morph,
          gain: state().gain,
        },
      });

      workletNode.connect(gainNode);
      gainNode.connect(analyserNode);
      analyserNode.connect(ctx.destination);
    }

    postSynthParams();
    state.set("isPlaying", true);
  };

  const stop = () => {
    if (!state().isPlaying) return;
    state.set("isPlaying", false);
    gainNode?.gain.cancelScheduledValues(audioContext?.currentTime ?? 0);
    gainNode?.gain.setValueAtTime(0, audioContext?.currentTime ?? 0);
  };

  const teardownAudio = async () => {
    state.set("isPlaying", false);
    try {
      workletNode?.disconnect();
      gainNode?.disconnect();
      analyserNode?.disconnect();
    } catch {
      // no-op
    }
    workletNode = null;
    gainNode = null;
    analyserNode = null;

    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }

    if (workletModuleUrl) {
      URL.revokeObjectURL(workletModuleUrl);
      workletModuleUrl = null;
    }
  };

  createEffect(() => {
    const playing = state().isPlaying;
    const gain = state().gain;
    if (!playing || !gainNode) return;
    const t = audioContext?.currentTime ?? 0;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.linearRampToValueAtTime(gain, t + 0.03);
  });

  createEffect(() => {
    const { frequency, morph, gain } = state();
    void frequency;
    void morph;
    void gain;
    if (!state().isPlaying) return;
    postSynthParams();
  });

  const draw = createWavetableDraw({
    morphTable: morphTables,
    get canvas() { return canvasRef; },
    get currentMorphRatio() { return state().morph; },
  });

  const drawAndLoop = (timeMs: number) => {
    draw(timeMs);
    rafId = requestAnimationFrame(drawAndLoop);
  };

  onMount(() => {
    rafId = requestAnimationFrame(drawAndLoop);
  });

  onCleanup(() => {
    if (rafId != null) cancelAnimationFrame(rafId);
    void teardownAudio();
  });

  return (
    <section class="w-full h-full p-4 md:p-8 flex flex-col gap-4 text-slate-100">
      <h1 class="text-2xl font-semibold">Wavetable Morph: sine to square</h1>

      <div class="w-full rounded-xl border border-slate-700/70 bg-slate-950/80 p-3 md:p-4">
        <canvas
          ref={canvasRef}
          class="size-full rounded-lg bg-slate-950"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-colors"
          onClick={() => void (state().isPlaying ? stop() : start())}
        >
          {state().isPlaying ? "Stop" : "Play"}
        </button>

        <label class="flex flex-col gap-1">
          <span class="text-sm text-slate-300">Morph ({state().morph.toFixed(2)})</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={state().morph}
            onInput={(e) => state.set("morph", Number(e.currentTarget.value))}
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
    </section>
  );
};

const createMorphTables = (p: { frameCount: number; tableSize: number }) => {
  const tables: Float32Array[] = [];

  for (let frame = 0; frame < p.frameCount; frame += 1) {
    const morph = frame / (p.frameCount - 1);
    const table = new Float32Array(p.tableSize);

    for (let i = 0; i < p.tableSize; i += 1) {
      const phase = (i / p.tableSize) * Math.PI * 2;
      const sine = Math.sin(phase);
      const square = sine >= 0 ? 1 : -1;
      table[i] = lerp(sine, square, morph);
    }

    tables.push(table);
  }

  return tables;
};

const flattenTables = (tables: Float32Array[]) => {
  const tableSize = tables[0]?.length ?? 0;
  const flat = new Float32Array(tables.length * tableSize);

  tables.forEach((table, frameIndex) => {
    flat.set(table, frameIndex * tableSize);
  });

  return flat;
};

const createWorkletModuleSource = () => {
  return `
class WavetableMorphProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const p = options?.processorOptions ?? {};

    this.tables = p.tables;
    this.frameCount = p.frameCount;
    this.tableSize = p.tableSize;
    this.phase = 0;
    this.frequency = p.frequency ?? 110;
    this.morph = p.morph ?? 0;
    this.gain = p.gain ?? 0.12;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.kind === "setFrequency") this.frequency = data.value;
      if (data.kind === "setMorph") this.morph = data.value;
      if (data.kind === "setGain") this.gain = data.value;
    };
  }

  sampleTable(frameIndex, samplePos) {
    const base = frameIndex * this.tableSize;
    const i0 = samplePos | 0;
    const i1 = (i0 + 1) % this.tableSize;
    const t = samplePos - i0;
    const a = this.tables[base + i0];
    const b = this.tables[base + i1];
    return a + (b - a) * t;
  }

  process(_inputs, outputs) {
    const output = outputs[0][0];
    if (!output) return true;

    const dt = this.frequency / sampleRate;
    const framePos = Math.min(Math.max(this.morph, 0), 1) * (this.frameCount - 1);
    const frameA = Math.floor(framePos);
    const frameB = Math.min(frameA + 1, this.frameCount - 1);
    const frameT = framePos - frameA;

    for (let i = 0; i < output.length; i++) {
      this.phase += dt;
      this.phase -= this.phase | 0;

      const samplePos = this.phase * this.tableSize;
      const a = this.sampleTable(frameA, samplePos);
      const b = this.sampleTable(frameB, samplePos);
      output[i] = (a + (b - a) * frameT) * this.gain;
    }

    return true;
  }
}

registerProcessor("wavetable-morph-processor", WavetableMorphProcessor);
`;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
