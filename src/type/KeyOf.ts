/**
 * Keyof also supports arrays and tuples.
 * @public
 */
export type KeyOf<T> =
  Readonly<T> extends readonly unknown[]
    ? Extract<keyof T, number>
    : keyof T;
