import { createContext, createMemo, useContext } from "solid-js";

import { Wve, WveValue } from "~/type/struct/Wve";
import { createEnvelopeNode } from "./createEnvelopeNode";

export const createEnvelope = (p: { p?: unknown }): EnvelopeContextProps => {
  const state = Wve.create<WveValue<EnvelopeContextProps["state"]>>({
    delay: 0.02,
    attack: 0.02,
    hold: 0.08,
    decay: 0.24,
    sustain: 0.55,
    release: 0.32,
    attackCurve: { x1: 0.25, y1: 0.15, x2: 0.4, y2: 1 },
    decayCurve: { x1: 0.15, y1: 0, x2: 0.45, y2: 1 },
    sustainCurve: { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 },
  });
  const node = createEnvelopeNode({ get envelope() { return state(); } });

  const graph = createMemo(() => {
    const current = state();
    const delay = Math.max(0, current.delay);
    const attack = Math.max(0.001, current.attack);
    const hold = Math.max(0, current.hold);
    const decay = Math.max(0.001, current.decay);
    const sustain = clamp(current.sustain, 0, 1);
    const release = Math.max(0.001, current.release);
    const sustainSpan = Math.max(0.12, release * 0.5);
    const sustainSettleValue = lerp(1, sustain, 0.65);

    const points = [
      { time: 0, value: 0 },
      { time: delay, value: 0 },
      { time: delay + attack, value: 1 },
      { time: delay + attack + hold, value: 1 },
      { time: delay + attack + hold + decay, value: sustainSettleValue },
      { time: delay + attack + hold + decay + sustainSpan, value: sustain },
      { time: delay + attack + hold + decay + sustainSpan + release, value: 0 },
    ] as const;

    const sampledPoints = [
      ...createSegmentSamples({ from: points[0]!, to: points[1]!, curve: LINEAR_CURVE, sampleCount: 8 }),
      ...createSegmentSamples({ from: points[1]!, to: points[2]!, curve: current.attackCurve, sampleCount: 28, skipFirst: true }),
      ...createSegmentSamples({ from: points[2]!, to: points[3]!, curve: LINEAR_CURVE, sampleCount: 8, skipFirst: true }),
      ...createSegmentSamples({ from: points[3]!, to: points[4]!, curve: current.decayCurve, sampleCount: 28, skipFirst: true }),
      ...createSegmentSamples({ from: points[4]!, to: points[5]!, curve: current.sustainCurve, sampleCount: 18, skipFirst: true }),
      ...createSegmentSamples({ from: points[5]!, to: points[6]!, curve: LINEAR_CURVE, sampleCount: 18, skipFirst: true }),
    ];

    return {
      points,
      sampledPoints,
      totalTime: points[points.length - 1]!.time || 1,
    };
  });

  return {
    state,
    get graph() { return graph(); },
    node,
  };
};

export type EnvelopeContextProps = {
  state: Wve<{
    delay: number;
    attack: number;
    hold: number;
    decay: number;
    sustain: number;
    release: number;
    attackCurve: EnvelopeBezier;
    decayCurve: EnvelopeBezier;
    sustainCurve: EnvelopeBezier;
  }>;
  graph: {
    points: readonly { time: number; value: number }[];
    sampledPoints: readonly { time: number; value: number }[];
    totalTime: number;
  };
  node: ReturnType<typeof createEnvelopeNode>;
};
export const EnvelopeContext = createContext<EnvelopeContextProps>();

export const useEnvelopeContext = () => {
  const context = useContext(EnvelopeContext);
  if (!context) {
    throw new Error("Envelope context is not available");
  }
  return context;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const LINEAR_CURVE: EnvelopeBezier = { x1: 0, y1: 0, x2: 1, y2: 1 };

const createSegmentSamples = (p: {
  from: { time: number; value: number };
  to: { time: number; value: number };
  curve: EnvelopeBezier;
  sampleCount: number;
  skipFirst?: boolean;
}) => {
  const count = Math.max(2, p.sampleCount);
  const points: { time: number; value: number }[] = [];

  for (let index = 0; index < count; index += 1) {
    if (p.skipFirst && index === 0) continue;
    const t = index / (count - 1);
    const eased = cubicBezierProgress(p.curve, t);
    points.push({
      time: lerp(p.from.time, p.to.time, t),
      value: lerp(p.from.value, p.to.value, eased),
    });
  }

  return points;
};

const cubicBezierProgress = (curve: EnvelopeBezier, x: number) => {
  const xTarget = clamp(x, 0, 1);
  const x1 = clamp(curve.x1, 0, 1);
  const y1 = clamp(curve.y1, 0, 1);
  const x2 = clamp(curve.x2, 0, 1);
  const y2 = clamp(curve.y2, 0, 1);

  let lower = 0;
  let upper = 1;
  let t = xTarget;

  for (let i = 0; i < 8; i += 1) {
    const xEstimate = cubicBezier(0, x1, x2, 1, t);
    if (Math.abs(xEstimate - xTarget) < 0.0005) break;
    if (xEstimate < xTarget) lower = t;
    else upper = t;
    t = (lower + upper) * 0.5;
  }

  return cubicBezier(0, y1, y2, 1, t);
};

const cubicBezier = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const mt = 1 - t;
  return (mt ** 3) * p0 + 3 * (mt ** 2) * t * p1 + 3 * mt * (t ** 2) * p2 + (t ** 3) * p3;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type EnvelopeBezier = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
