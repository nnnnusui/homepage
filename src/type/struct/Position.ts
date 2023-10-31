import { merge } from "@/fn/merge";
import { DeepPartial } from "@/type/DeepPartial";

export type Position = {
  x: number;
  y: number;
};
export const Position = (() => {
  const init = (): Position => ({
    x: 0,
    y: 0,
  });
  return {
    init,
    from: (
      partialOrVal: DeepPartial<Position> | number,
    ): Position => {
      const base = typeof partialOrVal === "object"
        ? merge(init(), partialOrVal)
        : {
          x: partialOrVal,
          y: partialOrVal,
        };
      return {
        x: base.x,
        y: base.y,
      };
    },
  };
})();
