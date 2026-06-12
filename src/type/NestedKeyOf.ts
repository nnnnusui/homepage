/**
 * Get nested objects keys tuples.
 * @public
 */
export type NestedKeyOf<T> =
  T extends Record<PropertyKey, unknown>
    ? {
      [Key in keyof Required<T>]: Required<T>[Key] extends object
        ? [Key, ...NestedKeyOf<Required<T>[Key]>]
        : [Key]
    }[keyof T]
    : Readonly<T> extends readonly unknown[]
      ? T[keyof T] extends object
        ? [Extract<keyof T, number>, ...NestedKeyOf<T[keyof T]>]
        : [Extract<keyof T, number>]
      : [];
