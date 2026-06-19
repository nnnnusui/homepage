import { onCleanup, onMount } from "solid-js";

import { Wve } from "~/type/struct/Wve";

/** @public */
export const createHover = () => {
  const state = Wve.create({ hover: false });

  return ({
    get hover() { return state().hover; },
    props: {
      onMouseEnter: () => state.set("hover", true),
      onMouseLeave: () => state.set("hover", false),
    },
    with: (ref: HTMLElement) => {
      onMount(() => {
        const onMouseEnter = () => state.set("hover", true);
        const onMouseLeave = () => state.set("hover", false);
        ref.addEventListener("mouseenter", onMouseEnter);
        ref.addEventListener("mouseleave", onMouseLeave);
        onCleanup(() => {
          ref.removeEventListener("mouseenter", onMouseEnter);
          ref.removeEventListener("mouseleave", onMouseLeave);
        });
      });
    },
  });
};
