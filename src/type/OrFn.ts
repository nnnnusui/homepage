/** @public */
export type OrFn<
  T,
  Args extends unknown[] = [],
>
  = T
  | ((...args: Args) => T);

/** @public */
export const OrFn = (() => {
  return {
    resolve: <T, Args extends unknown[]>(orFn: OrFn<T, Args>, ...args: Args): T =>
      orFn instanceof Function
        ? orFn(...args)
        : orFn,
  };
})();
