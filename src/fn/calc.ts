import { getMappedObject } from "./getMappedObject";

type CalcableObj = Record<PropertyKey, number>;
const getCalc = (
  calc: (lhs: number, rhs: number) => number,
) => <
  T extends CalcableObj
>(lhs: T, rhs: T | number): T =>
  getMappedObject(
    lhs,
    ([key, lVal]) =>
      calc(
        lVal,
        typeof rhs === "object"
          ? (rhs as T)[key] as number
          : rhs as number,
      ),
  ) as T;

export const Calc = (() => {
  const plus = getCalc((lhs, rhs) => lhs + rhs);
  const minus = getCalc((lhs, rhs) => lhs - rhs);
  const times = getCalc((lhs, rhs) => lhs * rhs);
  const div = getCalc((lhs, rhs) => lhs / rhs);
  const max = getCalc((lhs, rhs) => Math.max(lhs, rhs));
  const min = getCalc((lhs, rhs) => Math.min(lhs, rhs));
  return {
    get: getCalc,
    "+": plus,
    "-": minus,
    "*": times,
    "/": div,
    max,
    min,
    clamp: <
      T extends CalcableObj
    >(target: T, minVal: T, maxVal: T) => max(minVal, min(target, maxVal)),
    positiveDiff: getCalc((lhs, rhs) => Math.max(lhs, rhs) - Math.min(lhs, rhs)),
    opposite: <
      T extends CalcableObj
    >(lhs: T) => times(lhs, -1),
    orElse: (
      condition: (lhs: number) => boolean,
    ) => getCalc((lhs, rhs) =>
      condition(lhs) ? lhs : rhs,
    ),
  };
})();