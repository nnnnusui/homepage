type RangeOptions = {
  /** End point. */
  from?: number;
  /** Extend beyond the end point by a specified amount. */
  backwardExpansion?: number;
};
const rangeTo = (size: number) => [...Array(size)].map((_, i) => i);
const rangeFromTo = (to: number, options?: RangeOptions) => {
  const from = options?.from ?? 0;
  const diff = Math.abs(to - from);
  const direction = from <= to ? 1 : -1;
  const expansion = options?.backwardExpansion ?? 0;
  const size = diff + expansion;
  return rangeTo(Math.floor(size)).map((it) => (it * direction) + from);
};

/**
 * Generate numeric sequences.
 * @public
 */
export const range = (
  /** Start point. */
  to: number | undefined,
  /** Options can be assigned as an object. */
  options?: RangeOptions,
) => {
  return rangeFromTo(to ?? 0, options);
};
