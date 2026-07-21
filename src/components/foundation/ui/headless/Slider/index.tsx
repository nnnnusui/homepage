import { ParentProps, splitProps, untrack } from "solid-js";

import { Polymorphic, PolymorphicAs, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { createSlider, SliderContext } from "./createSlider";
import { Range } from "./Range";
import { Thumb } from "./Thumb";
import { Track } from "./Track";
import { ValueText } from "./ValueText";

const Root = <As extends PolymorphicAs>(_p: PolymorphicProps<As, ParentProps<Parameters<typeof createSlider>[0] | { api: ReturnType<typeof createSlider> }>>) => {
  const [p, wrappedProps] = splitProps(_p, ["as"]);
  const api = "api" in _p ? untrack(() => _p.api) : createSlider(_p);

  return (
    <SliderContext.Provider value={api}>
      <Polymorphic {...wrappedProps}
        as={p.as ?? ("class" in wrappedProps ? "div" : undefined)}
      >
        {wrappedProps.children}
      </Polymorphic>
    </SliderContext.Provider>
  );
};

/** @public */
export const Slider = Object.assign(Root, {
  Track,
  Range,
  Thumb,
  ValueText,
});

/** @public */
export { createSlider, useSliderContext } from "./createSlider";
