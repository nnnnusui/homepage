import { createStore, SetStoreFunction } from "solid-js/store";

import { Objects } from "~/fn/objects";
import { AnyArray } from "../AnyArray";
import { AnyObject } from "../AnyObject";
import { KeyOf } from "../KeyOf";
import { NestedKeyOf } from "../NestedKeyOf";
import { NestedValueOf } from "../NestedValueOf";
import { PartializedTuple } from "../PartializedTuple";
import { ValueOf } from "../ValueOf";

/**
 * A wrapper for Solid.js store that enables easy manipulation of complex data structures.
 *
 * @example
 * ```ts
 * const store = Wve.create({ user: { name: "John", age: 25 } });
 *
 * // Accessing nested properties
 * const userName = store.partial("user", "name");
 * console.log(userName()); // "John"
 * userName.set("Jane");
 *
 * // Filtering
 * const adult = store.filter(user => user.age >= 18);
 * ```
 *
 * @typeParam T - The type of data held by the store
 * @public
 */
export type Wve<T> = Atomic<T> & {
  /**
   * Creates a read-only view of the Wve store
   */
  readonly: () => ReadonlyWve<T>;

  /**
   * Creates a substore for a specific path in nested objects
   * @param keys - Property path to access
   */
  partial: PartialFn<T>;

  /**
   * Creates a new store containing only elements that match the condition
   * @param predicate - Filtering condition
   */
  filter: FilterFn<T>;

  /**
   * Applies a transformation to the store
   * @param apply - Transformation function
   */
  with: WithFn<T>;

  /**
   * Returns the store only if it matches the condition
   * @param matcher - Type guard function
   */
  when: WhenFn<T>;

  /**
   * Returns the store only if the value exists (not null/undefined)
   */
  whenPresent: WhenPresentFn<T>;

  /**
   * Converts a Wve<T> to Wve<T | undefined>
   */
  asMayBe: () => Wve<T | undefined>;
};

/**
 * Read-only view of Wve. This type does not expose `set`.
 * @typeParam T - The type of data held by the store
 * @public
 */
export type ReadonlyWve<T> = (() => T) & Omit<Wve<T>, "set">;

/**
 * Factory functions for creating and manipulating Wve stores
 * @public
 */
export const Wve = (() => {
  const atomicFrom = <T>(get: () => T, set: SetStoreFunction<T>): Atomic<T> =>
    Object.assign(get, { set });

  const completion = <T>(atomic: Atomic<T>): Wve<T> => {
    const wve = atomic as Wve<T>;
    return Object.assign(wve, {
      readonly: readonly(wve),
      partial: partial(wve),
      filter: filter(wve),
      with: withFn(wve),
      when: when(wve),
      whenPresent: whenPresent(wve),
      asMayBe: asMayBe(wve),
    });
  };

  /**
   * Creates a new Wve store
   * @param init - Initial value
   * @returns Wve store instance
   */
  const create = <T>(init: T): Wve<T> => {
    const [get, set] = createStore({ value: init });
    // @ts-expect-error: ...
    return completion(atomicFrom(() => get, set)).partial("value");
  };

  /**
   * Creates a new Wve store from an existing one
   * @param accessor - Function that returns an existing Wve store
   * @ts-expect-error: overloaded `from()` */
  const from: FromFn = (accessor) => {
    let cache: undefined | Wve<unknown>;
    const getCached = (reload?: boolean) => {
      if (reload || !cache) cache = accessor();
      return cache;
    };
    const wve = getCached();
    if (wve) return wve;
    const get = () => getCached(true)?.();
    // @ts-expect-error: bypass setter args.
    const set = (...args) => getCached()?.set(...args);
    return completion(atomicFrom(get, set));
  };

  /**
   * Creates a Wve store from separated getter/setter
   * @param get - Function to get value
   * @param set - Function that returns setter function
   */
  const fromSeparated = <T>(get: () => T, set: () => SetStoreFunction<T>): Wve<T> =>
    completion(atomicFrom(get, set()));

  /**
   * Wraps an optional Wve store
   * @param accessor - Function that returns an optional Wve store
   */
  const mayBe = <T>(accessor: () => Wve<T> | undefined): Wve<T | undefined> => {
    const get = () => accessor()?.();
    // @ts-expect-error: bypass setter args.
    const set = (...args) => accessor()?.set(...args);
    return completion(atomicFrom(get, set));
  };

  /**
   * Creates a read-only view of the Wve store
   */
  const readonly = <T>(wve: Wve<T>) => (): ReadonlyWve<T> => wve;

  /**
   * Creates a substore for a specific path in nested objects
   * @param keys - Property path to access
   */
  const partial = <T>(wve: Atomic<T>): PartialFn<T> => (...keys) =>
    // @ts-expect-error: fold partial.
    completion(keys.reduce((wve, key) => partialOnce(wve, key), wve));

  /**
   * @ts-expect-error: overloaded `filter()`. */
  const filter = <T>(wve: Atomic<T>): FilterFn<T> => (predicate) => {
    let filteredCache: unknown[] | undefined;
    let filteredIndexCache: number[] | undefined;
    const tryCacheFiltered = <T>(array: T[], predicate: (it: T) => boolean) => {
      const filtered = array.filter(predicate);
      if (!filteredCache) {
        filteredCache = filtered;
        filteredIndexCache = array.map((_,index) => index);
      }
      return filtered;
    };
    const get = () => {
      const base = wve();
      if (base == null) return base;
      if (Array.isArray(base)) return tryCacheFiltered(base, predicate);
      return Objects.entries(base)
        .filter(([key, value]) => predicate(value, key, base))
        .reduce((sum, [key]) => {
          return Object.defineProperty(sum, key, {
            get() { return base[key]; },
            enumerable: true,
          });
        }, {});
    };
    // @ts-expect-error: wrap setter.
    const set: SetStoreFunction<unknown> = (first, ...args) => {
      const base = wve.set;
      let predicatedCount = 0;
      const arrayFinder = (it: unknown, index: number, all: unknown[]) => {
        if (!predicate(it, index, all)) return true;
        if (!filteredCache) tryCacheFiltered(all, predicate);
        const next = first instanceof Function
          ? first(it, predicatedCount, filteredCache)
          : first;
        predicatedCount += 1;
        return next;
      };
      // @ts-expect-error: bypass setter args.
      if (args.length !== 0 && first instanceof Function) return base(arrayFinder, ...args);
      // @ts-expect-error: bypass setter args.
      if (args.length !== 0 && typeof first === "number") return base(filteredIndexCache[first] ?? first, ...args);
      // @ts-expect-error: bypass setter args.
      return base(first, ...args);
    };
    return completion(atomicFrom<unknown>(get, set));
  };

  const withFn = <T>(wve: Wve<T>): WithFn<T> => (apply) => apply(wve);

  const when = <T>(wve: Wve<T>): WhenFn<T> => (matcher) =>
    // @ts-expect-error: wve as Wve<S>
    matcher(wve()) ? wve : undefined;

  const whenPresent = <T>(wve: Wve<T>): WhenPresentFn<T> => () => when(wve)((it) => it != null);

  const asMayBe = <T>(wve: Wve<T>): AsMayBeFn<T> => () => wve as Wve<T | undefined>;

  const as = <To>(accessor: () => Wve<unknown>): Wve<To> =>
    accessor() as Wve<To>;

  const assign = <T, Assign extends AnyObject>(wve: Wve<T>, assign: Assign): Wve<T> & Assign => {
    Object.keys(assign).forEach((key) => {
      if (key in wve) return;
      Object.defineProperty(wve, key, {
        get() { return assign[key]; },
        enumerable: true,
      });
    });
    return wve as Wve<T> & Assign;
  };

  const truck = <T>(any: T): T => {
    if (typeof any === "object") {
      Object.keys(any as AnyObject).forEach((key) => {
        truck((any as AnyObject)[key]);
      });
    }
    return any;
  };

  const unwrap = <T>(wveValue: T): T => {
    const recursive = (value: unknown): unknown => {
      if (typeof value !== "object") return value;
      return Objects.entries(value as AnyObject)
        .reduce((obj, [key, val]) => {
          return { ...obj, [key]: recursive(val) };
        }, {} as AnyObject);
    };
    return recursive(wveValue) as T;
  };

  return {
    from,
    fromSeparated,
    create,
    mayBe,
    as,
    assign,
    truck,
    unwrap,
  };
})();

/** @public */
export type WveValue<T> = T extends Wve<infer V> ? V : never;

/**
 * Type providing basic store operations
 * @typeParam T - The type of data held by the store
 */
type Atomic<T> = (() => T) & {
  set: SetStoreFunction<T>;
};
type WhenFn<T> = <S extends T>(matcher: (it: T) => it is S) => Wve<S> | undefined;
type WhenPresentFn<T> = () => Wve<NonNullable<T>> | undefined;
type AsMayBeFn<T> = () => Wve<T | undefined>;
interface FromFn {
  <T>(accessor: () => Wve<T>): Wve<T>;
  <W extends Wve<unknown> | undefined>(accessor: () => W): W extends Wve<infer T> ? Wve<T | undefined> : never;
}

type PartialFn<T> = <
  Keys extends PartializedTuple<NestedKeyOf<T>>,
>(...keys: Keys) => Wve<NestedValueOf<T, Keys>>;

const partializeSetter = <T, Key extends keyof T>(
  setter: SetStoreFunction<T>,
  finder: unknown,
): SetStoreFunction<T[Key]> => { // @ts-expect-error: thru setter args.
  return (...args: unknown[]) => setter(finder, ...args);
};

const partialOnce = <T, Key extends KeyOf<T>>(wve: Atomic<T>, key: Key): Atomic<T[Key]> => {

  const get = () => wve()?.[key];
  const set = partializeSetter<T, Key>(wve.set, key);
  return Object.assign(get, { set }) as Atomic<T[Key]>;
};

type FilterFn<T>
  = T extends AnyArray
    ? FilterFnOfArray<T>
    : FilterFnOfObject<T>;

interface FilterFnOfArray<T> {
  <Guarded extends ValueOf<T>>(
    predicate: (it: ValueOf<T>, index: number, array: T) => it is Guarded,
  ): Wve<Guarded[]>;
  (
    predicate: (it: ValueOf<T>, index: number, array: T) => boolean
  ): Wve<T>;
}

interface FilterFnOfObject<T> {
  <Guarded extends ValueOf<T>>(
    predicate: (value: ValueOf<T>, key: KeyOf<T>, array: T) => value is Guarded,
  ): Wve<Record<KeyOf<T>, Guarded>>;
  (
    predicate: (value: ValueOf<T>, key: KeyOf<T>, array: T) => boolean
  ): Wve<T>;
}

type WithFn<T> = <S extends T, W extends Wve<S>>(apply: (wve: Wve<T>) => W) => W;
