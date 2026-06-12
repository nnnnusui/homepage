import { KeysOfValue } from "./KeysOfValue";
import { ValueOf } from "./ValueOf";

/**
 * Omit with a specific type of value.
 * @public
 */
export type OmitOfValue<T, Value extends ValueOf<T>> =
  Omit<T, KeysOfValue<T, Value>>;
