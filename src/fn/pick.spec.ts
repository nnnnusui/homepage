import { describe, it, expect } from "vitest";

import { pick } from "./pick";

describe("pick()", async () => {
  it("pick once", async () => {
    expect(
      pick({
        a: "foo",
        b: "bar",
      }, "b")
    ).toStrictEqual({
      b: "bar",
    });
  });

  it("pick many", async () => {
    expect(
      pick({
        a: "foo",
        b: "bar",
        c: "bazz",
      }, "b", "c")
    ).toStrictEqual({
      b: "bar",
      c: "bazz",
    });
  });
});
