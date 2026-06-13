import { JSX } from "solid-js";

/** @public */
export type HeadlessProps<T> = {
  class?: string;
  classList?: {
    [k: string]: boolean | undefined;
  };
  style?: string | JSX.CSSProperties;
} & T;

/** @public */
export const HeadlessProps = (() => {
  return {
    getStyles: (from: HeadlessProps<unknown>) => {
      return {
        class: from.class,
        classList: from.classList,
        style: from.style,
      };
    },
  };
})();
