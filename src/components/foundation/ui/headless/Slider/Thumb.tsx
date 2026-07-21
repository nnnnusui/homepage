import { splitProps , ParentProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { Calc } from "~/fn/objCalc";
import { createPointerEvent } from "~/fn/state/createPointerEvent";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";
import { useSliderContext } from "./createSlider";

export const Thumb = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [p,wrappedProps] = splitProps(_p, ["as"]);
  const context = useSliderContext();

  const state = Wve.create({
    dragging: false,
    dragStartPos: Pos.init(),
    dragStartValue: context.state().value,
  });

  const pointerEvent = createPointerEvent({
    on: {
      down: (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        state.set("dragging", true);
        state.set("dragStartPos", Pos.from({ x: e.clientX, y: e.clientY }));
        state.set("dragStartValue", context.state().value);
      },
      move: (e) => {
        if (!state().dragging) return;
        const currentPos = Pos.from({ x: e.clientX, y: e.clientY });
        const posDelta = Calc["-"](state().dragStartPos, currentPos);
        const delta = -posDelta.x + posDelta.y;
        const valueDelta = (delta / 180) * (context.max - context.min);
        const nextValue = state().dragStartValue + valueDelta;
        context.setValue(nextValue);
      },
      up: (e) => {
        state.set("dragging", false);
        context.applyValue();
      },
    },
    merge: wrappedProps,
  });

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? defaultAs}
      role="slider"
      aria-valuemin={context.min}
      aria-valuenow={context.state().value}
      aria-valuemax={context.max}
      {...pointerEvent.handlerMap}
      style={{
        ...wrappedProps.style,
        ["--slider-progress"]: `${context.valueRatio * 100}%`,
      }}
    />
  );
};

const defaultAs = "div" as const;
