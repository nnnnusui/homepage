import { Show } from "solid-js";

import { ButtonStyled } from "~/components/foundation/ui/ButtonStyled";
import { cn } from "~/fn/cn";
import { Wve } from "~/type/struct/Wve";

import styles from "./KeyboardVisibilityToggleButton.module.css";

export const KeyboardVisibilityToggleButton = (p: {
  visible: Wve<boolean>;
}) => {
  const visible = Wve.from(() => p.visible);

  return (
    <ButtonStyled class={cn(styles.KeyboardVisibilityToggleButton)}
      onApply={() => visible.set((prev) => !prev)}
      pressed={visible()}
    >
      <span>
        <Show when={visible()} fallback="Show">
          Hide
        </Show>
      </span>
      <span class=" "> </span>
      <span>Keyboard</span>
    </ButtonStyled>
  );
};
