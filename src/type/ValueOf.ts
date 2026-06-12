import { KeyOf } from "./KeyOf";

/**
 * @public
 */
export type ValueOf<T> = T[KeyOf<T>];
