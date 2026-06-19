export type IfArray<T, True, Else = never> =
  [T] extends [never]
    ? Else
    : Readonly<T> extends readonly unknown[]
      ? True
      : Else;
