/** @public */
export type Reverse<Tuple>
  = Tuple extends [infer Head, ...infer Rest]
    ? [...Reverse<Rest>, Head]
    : [];
