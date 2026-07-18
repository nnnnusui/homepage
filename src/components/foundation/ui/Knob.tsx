import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { createPointerEvent } from "~/fn/state/createPointerEvent";
import { withNeumorphism } from "~/fn/state/directive/withNeumorphism";
import { useTheme } from "~/fn/state/root/useTheme";
import { Wve } from "~/type/struct/Wve";

import styles from "./Knob.module.css";

const min = 0;
const max = 100;
const dragRangePx = 180;
const startDeg = 225;
const sweepDeg = 270;

const clamp = (value: number, minValue: number, maxValue: number) => {
  return Math.min(maxValue, Math.max(minValue, value));
};

export const Knob = () => {
  const state = Wve.create({
    value: 45,
    dragging: false,
    dragStartY: 0,
    dragStartValue: 45,
  });
  const theme = useTheme();

  const ratio = () => (state().value - min) / (max - min);

  const setValue = (next: number) => {
    state.set("value", clamp(Math.round(next), min, max));
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
        const valueDelta = (deltaY / dragRangePx) * (max - min);
        setValue(state().dragStartValue + valueDelta);
      },
      up: (e) => {
        state.set("dragging", false);
      },
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      setValue(state().value + 1);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      setValue(state().value - 1);
      return;
    }
    if (e.key === "PageUp") {
      e.preventDefault();
      setValue(state().value + 10);
      return;
    }
    if (e.key === "PageDown") {
      e.preventDefault();
      setValue(state().value - 10);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setValue(min);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setValue(max);
    }
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Knob"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={state().value}
      {...pointerEvent.handlerMap}
      onKeyDown={onKeyDown}
      class="relative grid size-20 place-items-center rounded-full select-none outline-none touch-none"
    >
      <div class={cn(styles.Arc, "absolute inset-0")}
        ref={chainUseRef([
          withNeumorphism(() => ({ shape: "pressed" })),
        ])}
        style={{
          "--start-deg": `${startDeg}deg`,
          "--end-deg": `${sweepDeg}deg`,
        }}
      />
      <div
        aria-hidden="true"
        class="absolute rounded-full inset-4"
        ref={chainUseRef([
          withNeumorphism(() => ({ shape: "concave" })),
        ])}
      >
        <div class="absolute inset-2.25 rounded-full"
          style={{
            transform: `rotate(${(45 + sweepDeg * ratio()) + startDeg}deg)`,
          }}
        >
          <div class="absolute w-1 h-3.25 rounded-full origin-top -rotate-45 -translate-x-1/2"
            style={{ "background-color": theme.accent }}
            ref={chainUseRef([
              withNeumorphism(() => ({ baseColor: theme.accent, shape: "concave" })),
            ])}
          />
        </div>
      </div>
      <div class={cn(styles.Arc, "absolute inset-0.5")}
        ref={chainUseRef([
          withNeumorphism(() => ({ shadowColor: theme.accent, shape: "pressed" })),
        ])}
        style={{
          "--start-deg": `${startDeg}deg`,
          "--end-deg": `${sweepDeg * ratio()}deg`,
          "--arc-width": "9px",
        }}
      />
      <span
        class="absolute bottom-0 text-xs font-semibold"
        style={{
          color: "#b9c2d5",
          "letter-spacing": "0.02em",
        }}
      >
        {state().value}
      </span>
    </div>
  );
};
