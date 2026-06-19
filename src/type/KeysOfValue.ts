import { KeyOf } from "./KeyOf";
import { ValueOf } from "./ValueOf";

/**
 * Get keys with a specific type of value.
 * @public
 */
export type KeysOfValue<T, Value extends ValueOf<T>> = {
  [Key in KeyOf<T>]-?: T[Key] extends Value ? Key : never
}[KeyOf<T>];
