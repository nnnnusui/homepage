import { describe, it, expectTypeOf } from "vitest";

import { Ifs } from "./Ifs";

describe("type Ifs", async () => {
  it("found first", async () => {
    type It = Ifs<[true]>;

    expectTypeOf<It>().toEqualTypeOf<true>();
  });

  it("found the first not never type", async () => {
    type It = Ifs<[never, never, false, never]>;

    expectTypeOf<It>().toEqualTypeOf<false>();
  });

  it("from empty to never", async () => {
    type It = Ifs<[]>;

    expectTypeOf<It>().toEqualTypeOf<never>();
  });

  it("from never to never", async () => {
    type It = Ifs<never>;

    expectTypeOf<It>().toEqualTypeOf<never>();
  });
});
