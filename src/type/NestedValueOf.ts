import { Ifs } from "./Ifs";

/**
 * Get value by keys from nested objects.
 * @public
 */
export type NestedValueOf<T, Keys, Unions extends unknown[] = []> =
  T extends NonNullable<T>
    ? NestedValueOfInner<T, Keys, Unions>
    : NestedValueOfInner<T, Keys, Unions> | undefined;

type NestedValueOfInner<T, Keys, Unions extends unknown[] = []> =
  Keys extends [infer Head, ...infer Tails]
    ? Head extends keyof NonNullable<T>
      ? Tails extends []
        ? GetValue<NonNullable<T>, Head> | Unions[number]
        : NestedValueOf<
          Required<NonNullable<T>>[Head],
          Tails,
          [...Unions, Exclude<GetValue<NonNullable<T>, Head>, object>]
        >
      : T
    : T;

type GetValue<T, Key extends keyof T> = Ifs<[
  IfRecord<T, T[Key] | undefined>,
  IfNotTupleArray<T, T[Key] | undefined>,
  T[Key],
]>;

type IfRecord<T, Then, Else = never>
  = T extends Record<infer Key, unknown>
    ? string extends Key
      ? Then
      : Else
    : Else;

type IfNotTupleArray<T, Then, Else = never>
  = T extends unknown[]
    ? T extends readonly unknown[]
      ? Then
      : Else
    : Else;

export type {
  GetValue as NestedValueOf_GetValue,
};
