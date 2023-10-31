import { merge } from "@/fn/merge";
import { DeepPartial } from "@/type/DeepPartial";

import { Position } from "./Position";
import { Size } from "./Size";

export type Camera = {
  scale: Size;
  translate: Position;
};
export const Camera = (() => {
  const init = () => ({
    scale: Size.init(),
    translate: Position.init(),
  });
  return {
    init,
    from: (partial: DeepPartial<Camera>): Camera => {
      const base = merge(init(), partial);
      return {
        scale: Size.from(base.scale),
        translate: Position.from(base.translate),
      };
    },
  };
})();
