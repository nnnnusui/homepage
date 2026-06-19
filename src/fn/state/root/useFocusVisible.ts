import { onMount , createRoot, onCleanup } from "solid-js";

import { Wve } from "~/type/struct/Wve";

const createFocusVisible = () => {
  const state = Wve.create({
    currentModality: null as Modality | null,
  });

  onMount(() => {
    const isVirtualClick = (e: MouseEvent | PointerEvent) => {
      // A click is considered virtual if it has no pointerType and no buttons pressed
      return e.detail === 0 && !("pointerType" in e);
    };
    const handleClick = (e: MouseEvent) => {
      if (!isVirtualClick(e)) return;
      state.set("currentModality", "virtual");
    };
    const handlePointer = () => state.set("currentModality", "pointer");
    const handleKeyboard = () => state.set("currentModality", "keyboard");

    // window.addEventListener("click", handleClick, true);
    window.addEventListener("keydown", handleKeyboard, true);
    window.addEventListener("keyup", handleKeyboard, true);
    window.addEventListener("pointerdown", handlePointer, true);
    window.addEventListener("pointermove", handlePointer, true);
    window.addEventListener("pointerup", handlePointer, true);

    onCleanup(() => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("keydown", handleKeyboard, true);
      window.removeEventListener("keyup", handleKeyboard, true);
      window.removeEventListener("pointerdown", handlePointer, true);
      window.removeEventListener("pointermove", handlePointer, true);
      window.removeEventListener("pointerup", handlePointer, true);
    });
  });

  return () => () => state().currentModality !== "pointer";
};

export const useFocusVisible = createRoot(createFocusVisible);

type Modality = "pointer" | "keyboard" | "virtual";
