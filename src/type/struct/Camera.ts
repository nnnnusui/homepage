import { merge } from "@/fn/merge";
import { DeepPartial } from "@/type/DeepPartial";

import { Position } from "./Position";
import { Size } from "./Size";

export type Camera = {
  scale: Size;
  position: Position;
};
export const Camera = (() => {
  const init = (): Camera => ({
    scale: Size.init(),
    position: Position.init(),
  });
  return {
    init,
    from: (partial: DeepPartial<Camera>): Camera => {
      const base = merge(init(), partial);
      return {
        scale: Size.from(base.scale),
        position: Position.from(base.position),
      };
    },
  };
})();
