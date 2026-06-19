export type IfNever<T, True, Else = T>
  = [T] extends [never]
    ? True
    : Else;
