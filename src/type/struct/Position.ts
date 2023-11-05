import { Size } from "@solid-primitives/resize-observer";

import { Calc } from "@/fn/calc";
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
    fromSize: (size: Size): Position => ({
      x: size.width,
      y: size.height,
    }),
    scaled: (p: {
      prev: Position;
      prevOrigin: Position;
      nextOrigin: Position;
      prevScale: Size;
      nextScale: Size;
    }) => {
      const cameraAtAbs = p.prev;
      const cameraAtAbsScaled = Calc["*"](cameraAtAbs, Position.fromSize(p.prevScale));
      const cursorAtAbsScaled = Calc["+"](cameraAtAbsScaled, p.prevOrigin);
      const cursorAtAbs = Calc["/"](cursorAtAbsScaled, Position.fromSize(p.prevScale));
      const cursorAtAbsNextScaled = Calc["*"](cursorAtAbs, Position.fromSize(p.nextScale));
      const cameraAtAbsNextScaled = Calc["-"](cursorAtAbsNextScaled, p.nextOrigin);
      const cameraAtAbsNext = Calc["/"](cameraAtAbsNextScaled, Position.fromSize(p.nextScale));
      return cameraAtAbsNext;
    },
  };
})();
