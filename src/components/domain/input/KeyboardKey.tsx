import { chainUseDirective } from "~/fn/chainUseDirective";
import { cn } from "~/fn/cn";
import { withNeumorphism } from "~/fn/state/directive/withNeumorphism";

import styles from "./KeyboardKey.module.css";

export const KeyboardKey = (p: {
  label: string;
  pressed?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
}) => {

  return (
    <div class={cn(styles.KeyboardKey, "size-full aspect-square rounded-r-4 flex items-center justify-center text-xs font-semibold")}
      ref={chainUseDirective([
        withNeumorphism(() => ({
          clarity: .8,
          depth: .5,
          get shape() {
            return p.pressed ? "pressed" : "flat";
          },
        })),
      ])}
    >
      {p.label}
    </div>
  );
};
