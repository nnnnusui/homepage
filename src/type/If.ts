export type If<T, True> =
  [never] extends [T]
    ? never
    : True;
