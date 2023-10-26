export const getObjectEntries = <
T extends Record<PropertyKey, unknown>
>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];
