import { createEffect, createMemo, onCleanup, onMount } from "solid-js";

import { useAudioEnvironment } from "~/fn/state/root/useAudioEnvironment";

export const createWaveTableNode = (p: {
  frequency: number;
  morph: number;
  gain: number;
  waveTableInstance: Float32Array[];
  frameCount: number;
  tableSize: number;
}) => {
  const flatTables = createMemo(() => flattenTables(p.waveTableInstance));
  const audioEnv = useAudioEnvironment();

  let workletNode: AudioWorkletNode | undefined;
  const workletNodeResolvers = Promise.withResolvers<AudioWorkletNode>();
  onMount(() => {
    const source = createWorkletModuleSource();
    const blob = new Blob([source], { type: "application/javascript" });
    const workletModuleUrl = URL.createObjectURL(blob);
    audioEnv.useContext(async ({ context }) => {
      await context.audioWorklet.addModule(workletModuleUrl);

      workletNode = new AudioWorkletNode(context, "wavetable-morph-processor", {
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
          tables: flatTables(),
          frameCount: p.frameCount,
          tableSize: p.tableSize,
          frequency: p.frequency,
          morph: p.morph,
          gain: p.gain,
        },
      });
      workletNodeResolvers.resolve(workletNode);
    });

    const teardownAudio = async () => {
      try {
        workletNode?.disconnect();
      } catch {
      // no-op
      }
      workletNode = undefined;

      if (workletModuleUrl) {
        URL.revokeObjectURL(workletModuleUrl);
      }
    };

    onCleanup(() => {
      void teardownAudio();
    });
  });

  createEffect(() => { void p.waveTableInstance; workletNode?.port.postMessage({ kind: "setTables", value: flattenTables(p.waveTableInstance) }); });
  createEffect(() => { void p.frequency; workletNode?.port.postMessage({ kind: "setFrequency", value: p.frequency }); });
  createEffect(() => { void p.morph; workletNode?.port.postMessage({ kind: "setMorph", value: p.morph }); });
  createEffect(() => { void p.gain; workletNode?.port.postMessage({ kind: "setGain", value: p.gain }); });

  return Object.assign(() => workletNode!, {
    ready: workletNodeResolvers.promise,
  });
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
      if (data.kind === "setTables") this.tables = data.value;
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
