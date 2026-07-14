import { describe, expect, it, expectTypeOf } from "vitest";

import { Branded, type Unbrand } from "./Branded";

describe("type Branded", () => {

  const __brandId = Symbol("brandId");
  const __brandUserId = Symbol("brandUserId");
  const __brandExtra = Symbol("brandExtra");
  type Id = Branded<string, typeof __brandId>;
  type UserId = Branded<Id, typeof __brandUserId>;

  it("can brand primitive types", () => {
    type BrandedString = Branded<string, "text">;
    type BrandedNumber = Branded<number, "count">;
    type BrandedBoolean = Branded<boolean, "flag">;

    expectTypeOf<Unbrand<BrandedString>>().toEqualTypeOf<string>();
    expectTypeOf<Unbrand<BrandedNumber>>().toEqualTypeOf<number>();
    expectTypeOf<Unbrand<BrandedBoolean>>().toEqualTypeOf<boolean>();
  });

  it("can brand object/record types", () => {
    type Obj = { a: "a"; b: "b" };
    type ObjBranded = Branded<Obj, "brand1">;
    type RecordBranded = Branded<Record<"x" | "y", number>, "recordBrand">;

    expectTypeOf<Unbrand<ObjBranded>>().toEqualTypeOf<Obj>();
    expectTypeOf<Unbrand<RecordBranded>>().toEqualTypeOf<Record<"x" | "y", number>>();
  });

  // it("works with union types", () => {
  //   type UnionBase = "a" | "b" | "c";

  //   type UnionBranded = Branded<UnionBase, "union">;

  //   expectTypeOf<Unbrand<UnionBranded>>().toEqualTypeOf<UnionBase>();
  // });

  it("works with intersection types", () => {
    type IntersectionBase = { a: 1 } & { b: 2 };

    type IntersectionBranded = Branded<IntersectionBase, "intersection">;

    expectTypeOf<Unbrand<IntersectionBranded>>().toEqualTypeOf<{
      a: 1;
      b: 2;
    }>();
  });

  it("can apply additional brand to an already branded type", () => {
    type ReBranded = Branded<UserId, typeof __brandExtra>;

    expectTypeOf<Unbrand<ReBranded>>().toEqualTypeOf<string>();
    expectTypeOf<Unbrand<ReBranded, typeof __brandExtra>>().toEqualTypeOf<UserId>();
  });

  it("keeps the remaining brand when unbranding a specific brand", () => {
    type IdFromUserId = Unbrand<UserId, typeof __brandUserId>;
    type UserFromId = Unbrand<UserId, typeof __brandId>;

    expectTypeOf<IdFromUserId>().toEqualTypeOf<Id>();
    expectTypeOf<Unbrand<IdFromUserId>>().toEqualTypeOf<string>();
    expectTypeOf<Unbrand<UserFromId>>().toEqualTypeOf<string>();
  });

  it("supports from/unbrand usage shown in examples", () => {
    const idfromuserid: UserId = Branded.from<Id, typeof __brandUserId>(
      Branded.from<string, typeof __brandId>("abc"),
    );

    type StringFromId = Unbrand<Id>;
    type StringFromUserId = Unbrand<UserId>;
    type UserIdFromId = Unbrand<UserId, typeof __brandUserId>;

    type A1 = Branded<{ a: "a"; b: "b" }, "brand1">;
    type A1O = Unbrand<A1, "brand1">;
    type A2 = Branded<A1, "brand2">;
    type A2O = Unbrand<A2, "brand2">;

    expectTypeOf<typeof idfromuserid>().toEqualTypeOf<UserId>();
    expectTypeOf<StringFromId>().toEqualTypeOf<string>();
    expectTypeOf<StringFromUserId>().toEqualTypeOf<string>();
    expectTypeOf<UserIdFromId>().toEqualTypeOf<Id>();

    expectTypeOf<A1O>().toEqualTypeOf<{ a: "a"; b: "b" }>();
    expectTypeOf<A2O>().toEqualTypeOf<A1>();
    expectTypeOf<Unbrand<A2>>().toEqualTypeOf<{ a: "a"; b: "b" }>();

    const raw = Branded.unbrand(idfromuserid);
    expect(raw).toBe("abc");
    expectTypeOf<typeof raw>().toEqualTypeOf<string>();
  });
});
