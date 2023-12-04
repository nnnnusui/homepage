export const merge = <
  Types extends unknown[]
>(...types: Types): Merge<Types> => {
  const functions = types.filter((it) => typeof it === "function");
  const objs = types.filter((it) => typeof it !== "function") as Record<PropertyKey, unknown>[];
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
  return [
    ...functions.reverse(),
    obj,
  ].reduce((sum, it) => Object.assign(sum, it));
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
