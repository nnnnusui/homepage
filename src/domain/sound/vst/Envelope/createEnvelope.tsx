import { createContext, useContext } from "solid-js";

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
    attackCurve: { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 },
    decayCurve: { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 },
    releaseCurve: { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 },
    scale: 1,
  });
  const node = createEnvelopeNode({ get envelope() { return state(); } });

  return {
    state,
    node,
    get maxTime() {
      const s = state();
      return s.delay + s.attack + s.hold + s.decay + s.release;
    },
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
    releaseCurve: EnvelopeBezier;
    scale: number;
  }>;
  node: ReturnType<typeof createEnvelopeNode>;
  maxTime: number;
};
export const EnvelopeContext = createContext<EnvelopeContextProps>();

export const useEnvelopeContext = () => {
  const context = useContext(EnvelopeContext);
  if (!context) {
    throw new Error("Envelope context is not available");
  }
  return context;
};

export type EnvelopeBezier = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
