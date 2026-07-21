import { createContext, useContext } from "solid-js";

import { Calc } from "~/fn/objCalc";
import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve, WveValue } from "~/type/struct/Wve";

export const createSlider = (p: {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onPreview?: (value: number) => void;
  onApply?: (value: number) => void;
  getProgress?: (ratio2D: Pos) => number;
}): SliderContextProps => {
  const min = () => p.min ?? 0;
  const max = () => p.max ?? 100;
  const step = () => p.step ?? 1;
  const digits = () => getSignificantDigits(step());
  const defaultValue = () => p.defaultValue ?? min();
  const state = Wve.create<WveValue<SliderContextProps["state"]>>({
    value: defaultValue(),
  });

  const applyValue = () => {
    p.onApply?.(state().value);
  };

  const setValue = (nextRaw: number) => {
    const steppedValue = Math.round(nextRaw / step()) * step();
    const next = Math.min(Math.max(steppedValue, min()), max());
    state.set("value", next);
    p.onPreview?.(next);
  };

  const getRatioFromPointerEvent = (e: PointerEvent) => {
    const localPos = Pos.fromEvent(e);
    const targetSize = Size.fromElement(e.currentTarget as HTMLElement);
    const ratio2D = Calc["/"](localPos, Pos.fromSize(targetSize));
    return p.getProgress ? p.getProgress(ratio2D) : ratio2D.x;
  };

  return {
    state,
    get min() { return min(); },
    get max() { return max(); },
    get step() { return step(); },
    get digits() { return digits(); },
    get defaultValue() { return defaultValue(); },
    get valueRatio() { return (state().value - min()) / (max() - min()); },
    setValue: setValue,
    setValueFromRatio: (ratio: number) => {
      const next = min() + ratio * (max() - min());
      setValue(next);
    },
    applyValue: applyValue,
    getRatioFromPointerEvent,
  };
};

export type SliderContextProps = {
  state: Wve<{
    value: number;
  }>;
  min: number;
  max: number;
  step: number;
  digits: number;
  defaultValue: number;
  valueRatio: number;
  setValue: (nextRaw: number) => void;
  setValueFromRatio: (ratio: number) => void;
  applyValue: () => void;
  getRatioFromPointerEvent: (e: PointerEvent) => number;
};
export const SliderContext = createContext<SliderContextProps>();

export const useSliderContext = () => {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("Slider context is not available");
  }
  return context;
};

const getSignificantDigits = (step: number): number => {
  const s = step.toString();

  if (s.includes("e-")) {
    return Number(s.split("e-")[1]);
  }

  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
};
