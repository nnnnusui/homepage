import { AnyObject } from "./AnyObject";
import { IfNever } from "./IfNever";
import { Ifs } from "./Ifs";
import { Simplify } from "./Simplify";

/**
 * Utility type for branding primitive types (nominal typing).
 *
 * If T is already Branded, merges the __brand property (union of brands).
 *
 * @example
 *   declare const __brandId: unique symbol;
 *   type Id = Branded<string, typeof __brandId>;
 *   declare const __brandUserId: unique symbol;
 *   type UserId = Branded<Id, typeof __brandUserId>;
 *   const id: UserId = Branded.from<UserId>("abc")
 *
 * @public
 */
export type Branded<T, Brand extends AnyBrand>
  = T extends { readonly [__brand]: infer B }
    // ? Branded<Unbrand<T>, keyof B | Brand>
    ? SimplifyIfObject<
      Unbrand<T> & { readonly [__brand]: Simplify<B & { readonly [K in Brand]: unknown }> },
      Unbrand<T>
    >
    : SimplifyIfObject<
      T & { readonly [__brand]: { readonly [K in Brand]: unknown } },
      T
    >;

export const Branded = (() => {
  /**
   * Type-safe conversion to a branded type. Enforces the base type of the brand.
   * @example
   *   Branded.from<Branded<string, typeof __brandId>>("abc") // value must be string
   */
  const from = <Raw, Brand extends AnyBrand>(value: Raw): Branded<Raw, Brand> => value as Branded<Raw, Brand>;

  const unbrand = <B extends Branded<unknown, AnyBrand>>(from: B): Unbrand<B> => from as Unbrand<B>;

  const define = <Brand extends AnyBrand, Raw>(__brand: Brand, raw: Raw) => {
    const from = (raw: Raw): Branded<Raw, Brand> => Branded.from<Raw, Brand>(raw);

    const unbrand = (branded: Branded<Raw, Brand>): Raw => Branded.unbrand(branded) as Raw;

    return {
      from,
      unbrand,
      type: raw as Branded<Raw, Brand>,
    };
  };

  return {
    from,
    unbrand,
    define,
  };
})();

declare const __brand: unique symbol;

/**
 * Recursively removes all Branded __brand properties, yielding the underlying primitive type.
 * @example
 *   type S = Unbrand<Branded<string, "Id">> // string
 *   type S2 = Unbrand<Branded<Branded<string, "Id">, "UserId">> // string
 * @public
 */
export type Unbrand<T, SpecifiedBrand extends AnyBrand = never>
  = IfNever<
    SpecifiedBrand,
    UnbrandAll<T>,
    T extends { readonly [__brand]: infer B }
      ? IfNever<
        keyof Omit<B, SpecifiedBrand>,
        UnbrandAll<T>,
        SimplifyIfObject<
          UnbrandAll<T> & {
            readonly [__brand]: Simplify<Omit<B, SpecifiedBrand>>;
          },
          UnbrandAll<T>
        >
      >
      : T
  >;

type UnbrandAll<T>
  = Ifs<[
    string extends Omit<T, typeof __brand> ? string : never,
    number extends Omit<T, typeof __brand> ? number : never,
    boolean extends Omit<T, typeof __brand> ? boolean : never,
    symbol extends Omit<T, typeof __brand> ? symbol : never,
    bigint extends Omit<T, typeof __brand> ? bigint : never,
    undefined extends Omit<T, typeof __brand> ? undefined : never,
    null extends Omit<T, typeof __brand> ? null : never,
    Omit<T, typeof __brand>,
  ]>;

type SimplifyIfObject<T, ObjCond>
  = ObjCond extends AnyObject
    ? Simplify<T>
    : T;

/** @public */
export type AnyBrand = symbol | string;
