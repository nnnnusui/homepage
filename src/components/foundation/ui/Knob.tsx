import { ParentProps } from "solid-js";

import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { createPointerEvent } from "~/fn/state/createPointerEvent";
import { createThrottleParAnimationFrame } from "~/fn/state/createThrottleParAnimationFrame";
import { withNeumorphism } from "~/fn/state/directive/withNeumorphism";
import { useTheme } from "~/fn/state/root/useTheme";
import { Wve } from "~/type/struct/Wve";

import styles from "./Knob.module.css";

const dragRangePx = 180;

const clamp = (value: number, minValue: number, maxValue: number) => {
  return Math.min(maxValue, Math.max(minValue, value));
};

export const Knob = (p: ParentProps<{
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onInput?: (value: number) => void;
  // onApply?: (value: number) => void;
  startDegree?: number;
  endDegree?: number;
  rotation?: "clockwise" | "counter-clockwise";
}>) => {
  const min = () => p.min ?? 0;
  const max = () => p.max ?? 100;
  const defaultValue = () => p.defaultValue ?? min();
  const step = () => p.step ?? 1;
  const digits = () => getSignificantDigits(step());
  const getRounded = (value: number) => Number(value.toFixed(digits()));
  const startDegree = () => p.startDegree ?? 235; //?? 225;
  const endDegree = () => p.endDegree ?? 125; //?? 135;
  const sweepDegree = () => (360 - startDegree() + endDegree()) % 360;
  const state = Wve.create({
    value: defaultValue(),
    dragging: false,
    dragStartY: 0,
    dragStartValue: defaultValue(),
  });
  const theme = useTheme();

  const ratio = () => (state().value - min()) / (max() - min());

  const setValueThrottled = createThrottleParAnimationFrame((_next: number, options?: { apply: boolean }) => () => {
    const next = clamp(getRounded(_next), min(), max());
    state.set("value", next);
    p.onInput?.(next);
  });
  const setValue = (_next: number, options?: { apply: boolean }) => {
    setValueThrottled.run(_next, options);
  };

  const pointerEvent = createPointerEvent({
    on: {
      down: (e) => {
        state.set("dragging", true);
        state.set("dragStartY", e.clientY);
        state.set("dragStartValue", state().value);
      },
      move: (e) => {
        if (!state().dragging) return;
        const deltaY = state().dragStartY - e.clientY;
        const valueDelta = (deltaY / dragRangePx) * (max() - min());
        setValue(state().dragStartValue + valueDelta);
      },
      up: (e) => {
        state.set("dragging", false);
        setValue(state().value, { apply: true });
      },
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      setValue(state().value + step(), { apply: true });
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      setValue(state().value - step(), { apply: true });
      return;
    }
    if (e.key === "PageUp") {
      e.preventDefault();
      setValue(state().value + 10, { apply: true });
      return;
    }
    if (e.key === "PageDown") {
      e.preventDefault();
      setValue(state().value - 10, { apply: true });
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setValue(min(), { apply: true });
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setValue(max(), { apply: true });
    }
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Knob"
      aria-valuemin={min()}
      aria-valuemax={max()}
      aria-valuenow={state().value}
      {...pointerEvent.handlerMap}
      onKeyDown={onKeyDown}
      class="relative min-w-15 aspect-square place-items-center rounded-full select-none outline-none touch-none"
    >
      <div class={cn(styles.Arc, "absolute inset-0")}
        ref={chainUseRef([
          withNeumorphism(() => ({ shape: "pressed" })),
        ])}
        style={{
          "--start-deg": `${startDegree()}deg`,
          "--end-deg": `${sweepDegree()}deg`,
        }}
      />
      <div
        aria-hidden="true"
        class="absolute rounded-full inset-3.25"
        ref={chainUseRef([
          withNeumorphism(() => ({ shape: "concave" })),
        ])}
      >
        <div class="absolute inset-2.25 rounded-full"
          style={{
            transform: `rotate(${(45 + sweepDegree() * ratio()) + startDegree()}deg)`,
          }}
        >
          <div class="absolute w-1 h-1/2 rounded-full origin-top -rotate-45 -translate-x-1/2"
            style={{ "background-color": theme.accent }}
            ref={chainUseRef([
              withNeumorphism(() => ({ baseColor: theme.accent, shape: "concave" })),
            ])}
          />
        </div>
      </div>
      <div class={cn(styles.Arc, styles.Indicate, "absolute inset-0.5")}
        ref={chainUseRef([
          withNeumorphism(() => ({ shadowColor: theme.accent, shape: "pressed" })),
        ])}
        style={{
          "--start-deg": `${startDegree()}deg`,
          "--end-deg": `${sweepDegree() * ratio()}deg`,
        }}
      />
      <span
        class="absolute bottom-0 text-xs font-semibold"
        style={{
          color: "#b9c2d5",
          "letter-spacing": "0.02em",
        }}
      >
        {p.children}
        {/* {state().value.toFixed(digits())} */}
      </span>
    </div>
  );
};

const getSignificantDigits = (step: number): number => {
  const s = step.toString();

  if (s.includes("e-")) {
    return Number(s.split("e-")[1]);
  }

  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
};
