import { splitProps , ParentProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { createPointerEvent } from "~/fn/state/createPointerEvent";
import { useSliderContext } from "./createSlider";

export const Track = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [p,wrappedProps] = splitProps(_p, ["as"]);
  const context = useSliderContext();

  const pointerEvent = createPointerEvent({
    on: {
      down: (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        const ratio = context.getRatioFromPointerEvent(e);
        context.setValueFromRatio(ratio);
      },
      move: (e) => {
        const ratio = context.getRatioFromPointerEvent(e);
        context.setValueFromRatio(ratio);
      },
      up: (e) => {
        context.applyValue();
      },
    },
    merge: wrappedProps,
  });

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? defaultAs}
      {...pointerEvent.handlerMap}
    />
  );
};

const defaultAs = "div" as const;
