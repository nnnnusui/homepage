import { Objects } from "./objects";

type CalcableObj = Record<PropertyKey, number>;
const getCalc = (
  calc: (lhs: number, rhs: number) => number,
) => <
  T extends CalcableObj,
>(lhs: T, rhs: T | number) =>
  Objects.map(
    lhs,
    (lVal: number, key: keyof T) =>
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
  return {
    get: getCalc,
    "+": plus,
    "-": minus,
    "*": times,
    "/": div,
    "%": getCalc((lhs, rhs) => lhs % rhs),
    floor: <T extends CalcableObj>(lhs: T) => getCalc((lhs) => Math.floor(lhs))(lhs, 1),
    ceil: <T extends CalcableObj>(lhs: T) => getCalc((lhs) => Math.ceil(lhs))(lhs, 1),
    round: <T extends CalcableObj>(lhs: T) => getCalc((lhs) => Math.round(lhs))(lhs, 1),
    max: getCalc((lhs, rhs) => Math.max(lhs, rhs)),
    min: getCalc((lhs, rhs) => Math.min(lhs, rhs)),
    positiveDiff: getCalc((lhs, rhs) => Math.max(lhs, rhs) - Math.min(lhs, rhs)),
    opposite: <T extends CalcableObj>(lhs: T) => times(lhs, -1),
    orElse: (
      condition: (lhs: number) => boolean,
    ) => getCalc((lhs, rhs) =>
      condition(lhs) ? lhs : rhs,
    ),
  };
})();
