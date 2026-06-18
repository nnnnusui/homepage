import { IfNever } from "~/type/IfNever";
import { Ifs } from "~/type/Ifs";
import { range } from "../range";

type ZipOptions = {
  mode: "shortest" | "longest" | "strict";
};

/**
 * Zip arrays by index.
 *
 * - `shortest`: uses the minimum input length.
 * - `longest`: uses the maximum input length.
 * - `strict`: currently follows runtime behavior of `longest`.
 *
 * When no arrays are provided, this returns an empty array.
 */
export const zip = <Arrays extends unknown[][], Options extends ZipOptions>(
  options: Options,
  ...arrays: Arrays
): Zipped<Arrays, Options> => {
  if (arrays.length === 0) return [] as Zipped<Arrays, Options>;
  const length = Math[options.mode === "shortest" ? "min" : "max"](...arrays.map((array) => array.length));
  return range(length).map((index) => arrays.map((array) => array[index])) as Zipped<Arrays, Options>;
};

/**
 * Type-level zip result for N arrays.
 *
 * This folds arrays left-to-right via `ZippedOnce` and expands nested pairs
 * into row tuples such as `[A, B, C]`.
 */
export type Zipped<Arrays extends unknown[][], Options extends ZipOptions>
  = Arrays extends [infer First extends unknown[], ...infer Rest extends unknown[][]]
    ? Rest extends []
      ? First extends unknown[]
        ? First
        : never
      : ExpandPairs<ZippedOnce<First, Zipped<Rest, Options>, Options>>
    : never;

/** [1, ["a", "A"]][] -> [1, "a", "A"][]
 *  [[1, ["a", "A"]], [2, ["b", "B"]]] -> [[1, "a", "A"], [2, "b", "B"]]
 */
type ExpandPairs<T extends unknown[]> = {
  [K in keyof T]:
  T[K] extends [infer A, infer B extends unknown[]]
    ? [B] extends [never]
      ? [A]
      : [A, ...B]
    : T[K];
};

/**
 * Type-level zip result for 2 arrays.
 *
 * In `strict` mode this may emit `"TypeError"` in the row sequence when
 * one side cannot provide another element.
 */
export type ZippedOnce<Lhs extends unknown[], Rhs extends unknown[], Options extends ZipOptions>
  = IfNever<
    Ifs<[
      [Lhs, Rhs] extends [[], []] ? [] : never,
      Options["mode"] extends "shortest" ? IfNever<ArrayHead<Lhs>, [], never> : never,
      Options["mode"] extends "shortest" ? IfNever<ArrayHead<Rhs>, [], never> : never,
      Options["mode"] extends "strict" ? Lhs extends [unknown, ...unknown[]] ? never : IfNever<ArrayHead<Lhs>, ["TypeError"], never> : never,
      Options["mode"] extends "strict" ? Rhs extends [unknown, ...unknown[]] ? never : IfNever<ArrayHead<Rhs>, ["TypeError"], never> : never,
    ]>,
    Lhs extends [infer LhsHead, ...infer LhsTail]
      ? Rhs extends [infer RhsHead, ...infer RhsTail]
        ? [PairMolded<LhsHead, RhsHead>, ...ZippedOnce<LhsTail, RhsTail, Options>]
        : [PairMolded<LhsHead, ArrayHead<Rhs>>, ...ZippedOnce<LhsTail, Rhs, Options>]
      : Rhs extends [infer RhsHead, ...infer RhsTail]
        ? [PairMolded<ArrayHead<Lhs>, RhsHead>, ...ZippedOnce<Lhs, RhsTail, Options>]
        : PairMolded<ArrayHead<Lhs>, ArrayHead<Rhs>>[]
  >;

type PairMolded<Lhs, Rhs>
  = CutUndefinedToRight<[IfNever<Lhs, undefined>, IfNever<Rhs, undefined>]>;

type CutUndefinedToRight<Pair extends unknown[]> = Pair extends [infer Lhs, infer Rhs]
  ? [Rhs] extends [undefined]
    ? Lhs extends undefined ? [] : [Lhs]
    : Pair
  : Pair;

type ArrayHead<T extends unknown[]>
  = T extends unknown[]
    ? T extends [infer Head, ...unknown[]]
      ? Head
      : T extends Array<infer Element>
        ? Element
        : never
    : never;
