export type Ifs<T extends unknown[]> =
  T extends [infer Head, ...infer Tails]
    ? [Head] extends [never]
      ? Ifs<Tails>
      : Head
    : never;
