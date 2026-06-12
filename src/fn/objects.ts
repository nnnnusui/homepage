import { AnyObject } from "~/type/AnyObject";
import { KeyOf } from "~/type/KeyOf";
import { OmitOfValue } from "~/type/OmitOfValue";
import { OptionalKeyOf } from "~/type/OptionalKeyOf";
import { PickOfValue } from "~/type/PickOfValue";
import { Reverse } from "~/type/Reverse";
import { ValueOf } from "~/type/ValueOf";
import { Arrays } from "./arrays";

/** @public */
export const Objects = (() => {
  const entries = <T extends AnyObject>(obj: T): Entry<T>[] =>
    Object.entries(obj) as Entry<T>[];
  const fromEntries = <T extends AnyEntries>(entries: T): FromEntries<T> =>
    Object.fromEntries(entries) as FromEntries<T>;
  const keys = <T extends AnyObject>(obj: T): (keyof T)[] =>
    Object.keys(obj);
  const values = <T extends AnyObject>(obj: T): T[keyof T][] =>
    Object.values(obj) as T[keyof T][];

  const modify = <T extends AnyObject, Modified extends AnyEntries>(
    obj: T,
    modifier: (entries: Entry<T>[]) => Modified,
  ): FromEntries<Modified> => Objects.fromEntries(modifier(Objects.entries(obj)));

  const map: MapFn = (obj, callback) => { // @ts-expect-error: rest parameters.
    return modify(obj, (entries) => entries.map(([key, value]) => [key, callback(value, key, obj)]));
  };

  /**
   * @ts-expect-error: overloaded `filter()`. */
  const filter: FilterFn = (obj, predicate) =>
    modify(obj, (entries) => entries.filter(predicate));

  /**
   * @ts-expect-error: overloaded `partition()`. */
  const partition: PartitionFn = (obj, predicate) => {
    const [pass, fail] = Arrays.partition(entries(obj), predicate);
    return [fromEntries(pass), fromEntries(fail)];
  };

  const isRequired = <T extends AnyObject>(obj: T, keyMap: { [Key in OptionalKeyOf<T>]: "" }): obj is Required<T> => {
    return Object.keys(keyMap).reduce((result, key) => result && (key in obj), true);
  };

  const when = <T extends AnyObject, S extends T>(obj: T, matcher: (it: T) => it is S): S | undefined =>
    matcher(obj) ? obj : undefined;

  const groupBy = <K extends PropertyKey, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K,
  ): Record<K, T[]> => Object.groupBy(items, keySelector) as Record<K, T[]>;

  return {
    entries,
    fromEntries,
    keys,
    values,
    modify,
    map,
    filter,
    partition,
    isRequired,
    when,
    groupBy,
  };
})();

type Entry<T extends AnyObject> = {
  [Key in KeyOf<T>]: [key: Key, value: T[Key]]
}[KeyOf<T>];
type AnyEntries = [PropertyKey, unknown][];
type FromEntries<T extends AnyEntries> = {
  [Key in T[number][0]]: Extract<T[number], [Key, unknown]>[1]
};

interface MapFn {
  <T extends AnyObject, S>(obj: T, callback: (...[value, key, all]: [...Reverse<Entry<T>>, T]) => S): Record<KeyOf<T>, S>;
  <T extends AnyObject, S>(obj: T, callback: (...[value, key]: Reverse<Entry<T>>) => S): Record<KeyOf<T>, S>;
  <T extends AnyObject, S>(obj: T, callback: (value: ValueOf<T>) => S): Record<KeyOf<T>, S>;
}

interface FilterFn {
  // <T, S extends ValueOf<T>>(
  //   obj: T,
  //   predicate: FilterPredicateWithTypeGuard<T, S>,
  // ): PickOfValue<T, S>;
  <T, S extends ValueOf<T>>(
    obj: T,
    predicate: ObjectFilterPredicateWithTypeGuard<T, S>,
  ): Record<KeyOf<T>, S>;
  <T>(
    obj: T,
    predicate: ObjectFilterPredicateWithBoolean<T>,
  ): T;
}
/** @public */
export type ObjectFilterPredicateWithTypeGuard<T, S extends ValueOf<T>> = (value: ValueOf<T>, key: KeyOf<T>, all: T) => value is S;
/** @public */
export type ObjectFilterPredicateWithBoolean<T> = (value: ValueOf<T>, key: KeyOf<T>, all: T) => boolean;

interface PartitionFn {
  <T, S extends ValueOf<T>>(
    obj: T,
    predicate: ObjectFilterPredicateWithTypeGuard<T, S>,
  ): [PickOfValue<T, S>, OmitOfValue<T, S>];
  <T>(
    obj: T,
    predicate: ObjectFilterPredicateWithBoolean<T>,
  ): [T, T];
}

// type Assigned<Target, Sources extends unknown[]> = {
//   0: Target;
//   1: ((...t: Sources) => unknown) extends ((head: infer Head, ...tail: infer Tail) => unknown)
//     ? Assigned<Omit<Target, keyof Head> & Head, Tail>
//     : never;
// }[Sources["length"] extends 0 ? 0 : 1];

// type OptionalKeyMap<T> = {
//   [Key in OptionalKeyOf<T>]: ""
// };
// type OptionalKeysOf<T> = [OptionalKeyOf<T>] extends [never] ? [] : {
//   [Key in OptionalKeyOf<T>]: [Key, ...OptionalKeysOf<Omit<T, Key>>];
// }[OptionalKeyOf<T>];
// type KeysOf<T> = {} extends T ? [] : {
//   [Key in keyof T]-?: [Key, ...KeysOf<Omit<Required<T>, Key>>];
// }[keyof T];
