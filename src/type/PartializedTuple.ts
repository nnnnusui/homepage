/**
 * Get partail tuples from tuple.
 * @public
 */
export type PartializedTuple<T extends readonly unknown[]>
  = T extends [infer Head, ...infer Tails]
    ? [Head] | [Head, ...PartializedTuple<Tails>]
    : never;
