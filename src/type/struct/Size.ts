import { merge } from "@/fn/merge";
import { DeepPartial } from "@/type/DeepPartial";

import { Position } from "./Position";

export type Size = {
  width: number;
  height: number;
};
export const Size = (() => {
  const init = (): Size => ({
    width: 1,
    height: 1,
  });
  return {
    init,
    from: (
      partialOrVal: DeepPartial<Size> | number,
    ): Size => {
      const base = typeof partialOrVal === "object"
        ? merge(init(), partialOrVal)
        : {
          width: partialOrVal,
          height: partialOrVal,
        };
      return {
        width: base.width,
        height: base.height,
      };
    },
    fromPosition: (position: Position): Size => ({
      width: position.x,
      height: position.y,
    }),
  };
})();
