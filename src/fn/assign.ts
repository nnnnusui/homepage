export const assign = <
  Lhs extends NonNullable<unknown>,
  Rhs
>(
  lhs: Lhs,
  rhs: Rhs,
): Lhs & Rhs =>
  Object.assign(lhs, rhs);
