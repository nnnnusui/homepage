import { EasingDefinition, WaveShapeDefinition, WaveTableDefinition } from "./createWaveTable";

export type WaveTableEasing = (t: number) => number;

export const getWaveTableInstance = (p: {
  frameCount: number;
  tableSize: number;
  define: WaveTableDefinition;
}) => {
  const frameCount = Math.max(1, p.frameCount);
  const tableSize = Math.max(1, p.tableSize);
  const define = normalizeDefine(p.define);
  const tables: Float32Array[] = [];

  for (let frame = 0; frame < frameCount; frame += 1) {
    const morph = frameCount === 1 ? 0 : frame / (frameCount - 1);
    const table = new Float32Array(tableSize);

    for (let i = 0; i < tableSize; i += 1) {
      const phase = (i / tableSize) * Math.PI * 2;
      table[i] = sampleByDefine(define, morph, phase);
    }

    tables.push(table);
  }

  return tables;
};

const sampleByDefine = (define: WaveTableInstance, morph: number, phase: number) => {
  const keyframes = define.keyframes;
  const first = keyframes[0]!;
  const last = keyframes[keyframes.length - 1]!;

  if (morph <= first.offset) return first.getFrameShape(phase);
  if (morph >= last.offset) return last.getFrameShape(phase);

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const a = keyframes[i]!;
    const b = keyframes[i + 1]!;
    if (morph > b.offset) continue;

    const span = Math.max(1e-6, b.offset - a.offset);
    const t = (morph - a.offset) / span;
    const easedT = a.getFrameEasing(t);
    return lerp(a.getFrameShape(phase), b.getFrameShape(phase), easedT);
  }

  return last.getFrameShape(phase);
};

const normalizeDefine = (define: WaveTableDefinition): WaveTableInstance => {
  const defaultEasing = EasingDefinition.compile(define.defaultEasing);
  const keyframes = [...define.keyframes]
    .map((keyframe) => ({
      ...keyframe,
      offset: clamp(keyframe.offset, 0, 1),
      getFrameEasing: keyframe.easing ? EasingDefinition.compile(keyframe.easing) : defaultEasing,
      getFrameShape: WaveShapeDefinition.compile(keyframe.shape),
    }))
    .sort((a, b) => a.offset - b.offset);

  if (keyframes.length === 0) {
    return {
      keyframes: [{ offset: 0, getFrameShape: () => 0, getFrameEasing: () => 0 }],
    };
  }

  return {
    ...define,
    keyframes,
  };
};

type WaveTableInstance = {
  keyframes: {
    getFrameShape: (phase: number) => number;
    getFrameEasing: (time: number) => number;
    offset: number;
  }[];
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
