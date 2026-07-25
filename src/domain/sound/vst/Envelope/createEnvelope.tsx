import { createContext, useContext } from "solid-js";

import { Pos } from "~/type/struct/Pos";
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

  const anchorMap = (): EnvelopeContextProps["anchorMap"] => ({
    delay: { kind: "delay", time: state().delay, gain: 0 },
    attack: { kind: "attack", time: state().attack, gain: 1 },
    hold: { kind: "hold", time: state().hold, gain: 1 },
    decay: { kind: "decay", time: state().decay, gain: state().sustain, valueKind: "sustain" },
    release: { kind: "release", time: state().release, gain: 0 },
  });
  const viewBoxHeight = () => 100;
  const pixelsPerSecond = () => state().scale;
  const getEnvelopeSetter: EnvelopeContextProps["getEnvelopeSetter"] = (timeSetterKind, valueSetterKind?) => (e) => {
    state.set(timeSetterKind, e.start.time + e.delta.x / state().scale);
    if (valueSetterKind) state.set(valueSetterKind, (e.start.gain - (e.delta.y / viewBoxHeight())));
  };

  return {
    state,
    node,
    get maxTime() {
      const s = state();
      return s.delay + s.attack + s.hold + s.decay + s.release;
    },
    get anchorMap() { return anchorMap(); },
    getEnvelopeSetter,
    get viewBoxHeight() { return viewBoxHeight(); },
    normalizePosToViewBox: (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: viewBoxHeight() - pos.y * viewBoxHeight() }),
    normalizeDeltaToViewBox: (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: -pos.y * viewBoxHeight() }),
    normalizeBezier,
    ratioDeltaFromViewBoxDelta: (delta, p) => Pos.from({ x: delta.x / pixelsPerSecond() / p.time(), y: -delta.y / viewBoxHeight() / p.gainDelta() }),
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
  anchorMap: Record<AnchorKind, EnvelopeAnchor>;
  getEnvelopeSetter: (timeSetterKind: SetterKind, valueSetterKind?: SetterKind) => (e: { start: { time: number; gain: number }; delta: Pos }) => void;
  viewBoxHeight: number;
  normalizePosToViewBox: (pos: Pos) => Pos;
  normalizeDeltaToViewBox: (pos: Pos) => Pos;
  normalizeBezier: (p: { curve: EnvelopeBezier; offset: Pos; delta: Pos }) => EnvelopeBezier;
  ratioDeltaFromViewBoxDelta: (delta: Pos, p: { time: () => number; gainDelta: () => number }) => Pos;
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

const anchorKinds = ["delay", "attack", "hold", "decay", "release"] as const;
type AnchorKind = typeof anchorKinds[number];
type SetterKind = keyof WveValue<EnvelopeContextProps["state"]>;
type EnvelopeAnchor = { kind: AnchorKind; time: number; gain: number; valueKind?: SetterKind };

const normalizeBezier = (p: { curve: EnvelopeBezier; offset: Pos; delta: Pos }) => {
  const x1 = p.offset.x + p.curve.x1 * p.delta.x;
  const x2 = p.offset.x + p.curve.x2 * p.delta.x;
  const y1 = p.offset.y + p.curve.y1 * p.delta.y;
  const y2 = p.offset.y + p.curve.y2 * p.delta.y;
  return { x1, y1, x2, y2 };
};
