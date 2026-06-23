import { ComponentProps } from "solid-js";

import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { createFocus } from "~/fn/state/createFocus";
import { createHover } from "~/fn/state/createHover";
import { withNeumorphism } from "~/fn/state/directive/withNeumorphism";
import { useFocusVisible } from "~/fn/state/root/useFocusVisible";
import { Override } from "~/type/Override";
import { Button } from "./headless/Button";

import styles from "./ButtonStyled.module.css";

/** @public */
export const ButtonStyled = (p: Override<
  ComponentProps<typeof Button<"button">>,
  {
    pressed?: boolean;
  }
>) => {
  const focusVisible = useFocusVisible();
  const focus = createFocus();
  const hover = createHover();

  return (
    <Button {...p}
      onApply={p.onApply}
      {...hover.props}
      class={cn(styles.ButtonStyled, p.class)}
      ref={chainUseRef([
        withNeumorphism(() => ({
          get shape() {
            if (p.pressed) return "pressed";
            // if (hover.hover || (focus.focus && focusVisible())) return "concave";
            return "convex";
          },
        })),
        focus.with,
        hover.with,
      ])}
    />
  );
};
