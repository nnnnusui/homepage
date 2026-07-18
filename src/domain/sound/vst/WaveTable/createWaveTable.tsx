import { createContext, createMemo, useContext } from "solid-js";

import { Id } from "~/type/struct/Id";
import { Wve, WveValue } from "~/type/struct/Wve";
import { createWaveTableNode } from "./createWaveTableNode";
import { getWaveTableInstance } from "./getWaveTableInstance";

export const createWaveTable = (p: { p?: unknown }): WaveTableContextProps => {
  const state = Wve.create<WveValue<WaveTableContextProps["state"]>>({
    currentMorphRatio: 0,
    isPlaying: false,
    frequency: 440,
    gain: 1,
    definition: {
      keyframes: [
        { id: WaveTableDefinition.KeyframeId.from("1"), offset: 0, shape: { type: "builtin", id: "sine" }, easing: undefined },
        { id: WaveTableDefinition.KeyframeId.from("2"), offset: 1, shape: { type: "builtin", id: "square" }, easing: undefined },
      ],
      defaultEasing: { type: "builtin", id: "linear" },
    },
  });

  const frameCount = () => 64;
  const tableSize = () => 2048;
  const instance = createMemo(() => {
    const frameCountFixed = Math.max(1, Math.floor(frameCount()));
    const tableSizeFixed = Math.max(1, Math.floor(tableSize()));
    const samples = getWaveTableInstance({
      frameCount: frameCountFixed,
      tableSize: tableSizeFixed,
      define: state().definition,
    });
    return {
      get samples() { return samples; },
      get frameCount() { return frameCountFixed; },
      get tableSize() { return tableSizeFixed; },
    };
  });

  const node = createWaveTableNode({
    get frequency() { return state().frequency; },
    get morph() { return state().currentMorphRatio; },
    get gain() { return state().gain; },
    get waveTableInstance() { return instance().samples; },
    get frameCount() { return instance().frameCount; },
    get tableSize() { return instance().tableSize; },
  });

  return {
    state,
    get instance() { return instance(); },
    get currentWave() {
      const morphRatio = state().currentMorphRatio;
      const frameCount = instance().frameCount;
      const tableSize = instance().tableSize;
      const samples = instance().samples;
      if (frameCount === 0 || tableSize === 0) return undefined;
      const frameIndex = Math.floor(morphRatio * (frameCount - 1));
      return samples[frameIndex];
    },
    node,
  };
};

export type WaveTableContextProps = {
  state: Wve<{
    currentMorphRatio: number;
    isPlaying: boolean;
    frequency: number;
    gain: number;
    definition: WaveTableDefinition;
  }>;
  instance: {
    samples: Float32Array[];
    frameCount: number;
    tableSize: number;
  };
  currentWave: Float32Array<ArrayBufferLike> | undefined;
  node: ReturnType<typeof createWaveTableNode>;
};
export const WaveTableContext = createContext<WaveTableContextProps>();

export const useWaveTableContext = () => {
  const context = useContext(WaveTableContext);
  if (!context) {
    throw new Error("WaveTable context is not available");
  }
  return context;
};

export type WaveTableDefinition = {
  keyframes: WaveTableKeyframe[];
  defaultEasing: EasingDefinition;
};
const KeyframeId = Id.define(Symbol("keyframeId"));
const ShapeId = Id.define(Symbol("shapeId"));
const EasingId = Id.define(Symbol("easingId"));
export const WaveTableDefinition = (() => {
  return {
    KeyframeId: KeyframeId,
    ShapeId,
    EasingId,
  };
})();

export type WaveTableKeyframe = {
  id: typeof KeyframeId.type;
  offset: number;
  shape: WaveShapeDefinition;
  easing: EasingDefinition | undefined;
};

export type WaveShapeDefinition
  = { type: "builtin"; id: keyof typeof WaveShapeDefinition.builtinMap };
export const WaveShapeDefinition = (() => {
  const builtinMap = {
    sine: (phase: number) => Math.sin(phase),
    square: (phase: number) => (Math.sin(phase) >= 0 ? 1 : -1),
    triangle: (phase: number) => (2 / Math.PI) * Math.asin(Math.sin(phase)),
    saw: (phase: number) => {
      const t = phase / (Math.PI * 2);
      return ((t - Math.floor(t + 0.5)) * 2);
    },
    halfSine: (phase: number) => Math.max(0, Math.sin(phase)),
  } as const;

  return {
    builtinMap,
    compile: (difinition: WaveShapeDefinition) => {
      if (difinition.type === "builtin") return builtinMap[difinition.id];
      return builtinMap.sine;
    },
  };
})();

export type EasingDefinition
  = { type: "builtin"; id: keyof typeof EasingDefinition.builtinMap };
export const EasingDefinition = (() => {
  const builtinMap = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
    easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2),
  } as const;

  return {
    builtinMap,
    compile: (difinition: EasingDefinition) => {
      if (difinition.type === "builtin") return builtinMap[difinition.id];
      return builtinMap.linear;
    },
  };
})();

export type WaveTableEasing = (t: number) => number;
