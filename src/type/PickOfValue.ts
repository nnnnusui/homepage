import { KeysOfValue } from "./KeysOfValue";
import { ValueOf } from "./ValueOf";

/**
 * Pick with a specific type of value.
 * @public
 */
export type PickOfValue<T, Value extends ValueOf<T>> =
  Pick<T, KeysOfValue<T, Value>>;
