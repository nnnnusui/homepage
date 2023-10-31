export const pick = <
  T extends Record<PropertyKey, unknown>,
  Keys extends (keyof T)[]
>(obj: T, ...keys: Keys): Pick<T, ArrayElementType<Keys>> =>
  keys.reduce((sum, key) => {
    sum[key] = obj[key];
    return sum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as any);

type ArrayElementType<
  T extends ReadonlyArray<unknown>
> = T extends ReadonlyArray<infer ElementType>
  ? ElementType
  : never
