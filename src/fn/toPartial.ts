import { SetStoreFunction } from "solid-js/store";

type PartialGetter<T> =
  T extends unknown[]
    ? <Key extends number>(finder: (prev: T[Key]) => boolean) => SetStoreFunction<T[Key]>
    : <Key extends keyof T>(key: Key) => SetStoreFunction<T[Key]>

/* eslint-disable @typescript-eslint/ban-ts-comment */
export const toPartial
  = <T>(
    setter: SetStoreFunction<T>
    // @ts-ignore
  ): PartialGetter<T> => (key) => (...args: unknown[]) => setter(key, ...args);
/* eslint-enable */
