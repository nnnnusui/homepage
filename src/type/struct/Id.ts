import { v7 } from "uuid";

import { AnyBrand, Branded, Unbrand } from "~/type/Branded";

type Raw = string;

/**
 * Unique identifier string (UUID v7), branded to distinguish from plain string.
 *
 * Uses Branded utility for type safety.
 * @public
 */
export type Id = Branded<Raw, typeof __id>;

/**
 * Utility for working with Ids.
 * @public
 */
export const Id = (() => {
  /**
   * Creates an Id from an existing string value.
   * Use this when you have a pre-generated ID or need to wrap a raw string as an Id.
   * @param {string} raw - The raw string value to convert to an Id
   * @returns {Id} The branded Id
   * @example
   *   const id = Id.from("existing-id-value"); // Use with known IDs
   */
  const from = (raw: string): Id => Branded.from<Raw, typeof __id>(raw);

  /**
   * Generates a new unique Id (UUID v7).
   * @returns {Id} New unique identifier string
   */
  const generate = (): Id => from(v7());

  /**
   * Extracts the underlying string value from an Id. Inverse operation of `from` or `generate`.
   * @param {Id} id - The branded Id to unbrand
   * @returns {string} The raw string value
   * @example
   *   const id = Id.generate();
   *   const raw: string = Id.unbrand(id); // Get the UUID string
   */
  const unbrand = (id: Id): Raw => Branded.unbrand(id);

  const idFn = {
    generate,
    from,
    unbrand,
  };

  const define = <Brand extends AnyBrand>(__brand: Brand) => {
    const generate = (): Branded<Id, Brand> => Branded.from<Id, Brand>(idFn.generate());

    const from = (raw: Raw): Branded<Id, Brand> => Branded.from<Id, Brand>(idFn.from(raw));

    const unbrand = (branded: Branded<Id, Brand>): Unbrand<Branded<Id, Brand>, Brand> => branded;

    return {
      generate,
      from,
      unbrand,
      type: "" as Branded<Id, Brand>,
    };
  };

  return {
    ...idFn,
    define,
  };
})();

const __id = Symbol("id");
