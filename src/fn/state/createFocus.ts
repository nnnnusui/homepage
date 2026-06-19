import { onCleanup, onMount } from "solid-js";

import { Wve } from "~/type/struct/Wve";

/** @public */
export const createFocus = () => {
  const state = Wve.create({ focus: false });

  return ({
    get focus() { return state().focus; },
    props: {
      onFocus: () => state.set("focus", true),
      onBlur: () => state.set("focus", false),
    },
    with: (ref: HTMLElement) => {
      onMount(() => {
        const onFocus = () => state.set("focus", true);
        const onBlur = () => state.set("focus", false);
        ref.addEventListener("focus", onFocus);
        ref.addEventListener("blur", onBlur);
        onCleanup(() => {
          ref.removeEventListener("focus", onFocus);
          ref.removeEventListener("blur", onBlur);
        });
      });
    },
  });
};
