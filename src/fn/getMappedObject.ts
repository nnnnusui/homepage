/**
 * typed `Object.entries`
 */
export const getMappedObject = <
  T extends Record<PropertyKey, unknown>,
  Key extends keyof T,
  MappedValue
>(
  obj: T,
  mapper: (entry: [key: Key, value: T[Key]]) => MappedValue,
): Record<keyof T, MappedValue> =>
  Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) =>
        [key, mapper([key as Key, value as T[Key]])],
      ),
  ) as Record<keyof T, MappedValue>;
