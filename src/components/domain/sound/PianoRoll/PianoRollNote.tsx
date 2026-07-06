import { ParentProps } from "solid-js";

import { cn } from "~/fn/cn";

import styles from "./PianoRollNote.module.css";

/**
 * Note element for piano roll.
 * Sizes based on duration, delegates rendering content to children.
 */
export const PianoRollNote = (p: ParentProps<{
  /** Duration in pixels */
  duration: number;
}>) => {
  return (
    <div
      class={cn(styles.PianoRollNote)}
      style={{
        width: `${p.duration}px`,
      }}
    >
      {p.children}
    </div>
  );
};
