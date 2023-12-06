/**
 * 汎用deepMerge処理
 *
 * - 空の場合は`undefined`を返す。
 * - primitive型は最後の値を返す。
 * - primitive型よりobject型が優先される。
 * - primitive型よりfunction型が優先される。
 * - object型はdeepMergeされる。
 * - object型とfunction型はmergeされる。
 * - function型については下記の規則でmergeされる。
 *   - 引数の数が同一な全ての関数が実行される。呼び出し時に型は考慮されない。
 *   - 引数の数が同一なら結果がmergeされる。
 *   - 引数の数が異なるなら其々別の関数として独立する。
 *   - 引数の数によって実行される関数が決定する。
 *   - 可変長引数は考慮されない。
 */
export const merge = <
  Types extends unknown[]
>(...types: Types): Merge<Types> => {
  const functions = types.filter((it) => typeMapper.fn.includes(typeof it)) as AnyFunction[];
  const objs = types.filter((it) => typeMapper.obj.includes(typeof it)) as AnyObject[];
  const primitives = types.filter((it) => typeMapper.primitives.includes(typeof it)) as AnyPrimitive[];
  if (
    functions.length === 0
    && objs.length === 0
  ) {
    return primitives.findLast(() => true) as unknown as Merge<Types>;
  }

  const keys = objs.flatMap((obj) => Object.keys(obj));
  const obj = Object.fromEntries(
    keys.map((key) =>
      [
        key,
        objs.reduce((proc, obj) => {
          const val = obj?.[key];
          if (val == null) return proc;
          const mergeable
            = typeof val === "object"
              && typeof (proc ?? {}) === "object";
          return !mergeable
            ? val
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : merge(proc ?? {} as any, val);
        }, undefined as unknown),
      ],
    ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;

  const fn = (() => {
    if (functions.length === 0) return;
    // functions.groupToMap((it) => it.length)
    const functionsMap = new Map<number, AnyFunction[]>();
    functions.forEach((it) => {
      const map = functionsMap;
      const key = it.length;
      const value = it;
      const mayBe = map.get(key);
      if (mayBe === undefined) {
        map.set(key, [value]);
      } else {
        mayBe.push(value);
      }
    });

    return (...args: unknown[]) => {
      return merge(
        ...functionsMap.get(args.length)
          ?.map((it) => it(...args)) ?? []
      );
    };
  })();

  const mergedParType = [
    fn,
    obj,
  ].filter((it) => it !== undefined);
  if (mergedParType.length === 0) return undefined as unknown as Merge<Types>;
  if (mergedParType.length === 1) return mergedParType[0];
  return mergedParType.reduce((sum, it) => Object.assign(sum, it));
};

export type Merge<Types> =
  Types extends [infer Head, ...infer Tails]
    ? Tails extends []
      ? Head
      : MergeOnce<Head, Merge<Tails>>
    : Types;

type MergeOnce<A, B> =
  B extends Record<PropertyKey, unknown>
    ? A extends Record<PropertyKey, unknown>
      ? MergeObject<A, B>
      : MergeValue<A, B>
    : MergeValue<A, B>;

type MergeObject<
  A extends Record<PropertyKey, unknown>,
  B extends Record<PropertyKey, unknown>
> = {
  [Key in keyof B | keyof A]: MergeValue<
  ValueOr<A, Key, undefined>,
  ValueOr<B, Key, undefined>
  >
}

type MergeValue<A, B> =
  [B] extends [(undefined | null | never)]
    ? A
    : [(A & B)] extends [never] ? B : A & B;

type ValueOr<T, Key extends PropertyKey, Or>
  = T extends { [K in Key]?: unknown }
    ? T[Key]
    : Or;

type TypeOfValues = {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: Record<PropertyKey, unknown>;
  function: (...args: unknown[]) => unknown;
};
const typeMap = {
  fn: ["function"],
  obj: ["object"],
  primitives: ["string", "number", "bigint", "boolean", "symbol", "undefined"],
} as const;
type AnyFunction = TypeOfValues[typeof typeMap["fn"][number]]
type AnyObject = TypeOfValues[typeof typeMap["obj"][number]]
type AnyPrimitive = TypeOfValues[typeof typeMap["primitives"][number]]
const typeMapper = typeMap as unknown as Record<keyof typeof typeMap, (keyof TypeOfValues)[]>;
