import { Accessor, createEffect, onCleanup } from "solid-js";

import { Size } from "~/type/struct/Size";
import { Wve } from "~/type/struct/Wve";

/** @public */
export const createElementSize = (element: Accessor<HTMLElement | undefined>, options?: {
  setSize?: (size: Size) => void;
}) => {
  const state = Wve.create(Size.init());

  const updateSize = () => {
    const ref = element();
    if (!ref) return;
    state.set("width", ref.offsetWidth);
    state.set("height", ref.offsetHeight);
    options?.setSize?.({ width: ref.offsetWidth, height: ref.offsetHeight });
  };

  createEffect(() => {
    const ref = element();
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (ref) observer.observe(ref);
    onCleanup(() => {
      observer.disconnect();
    });
  });

  return state.readonly();
};
