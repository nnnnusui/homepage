import { describe, it, expect } from "vitest";

import { merge } from "./merge";

describe("merge()", async () => {
  it("returns undefined if empty", async () => {
    const merged = merge();
    expect(merged).toBe(undefined);
  });
  it("return primitive as is", async () => {
    const merged = merge("str");
    expect(merged).toBe("str");
  });
  it("only the last primitive", async () => {
    const merged = merge("str", 42);
    expect(merged).toBe(42);
  });
  it("return object as is", async () => {
    const merged = merge({ any: "any" });
    expect(merged).toStrictEqual({ any: "any" });
  });
  it("return function as is", async () => {
    const merged = merge(() => "fn");
    expect(merged()).toBe("fn");
  });

  it("primitives are overwritten by object", async () => {
    const merged = merge("str", { any: "any" }, 42);
    expect(merged).toStrictEqual({ any: "any" });
  });

  it("flatten", async () => {
    const merged = merge({
      a: "foo",
      b: "bar",
    }, {
      c: "bazz",
    });
    expect(merged).toStrictEqual({
      a: "foo",
      b: "bar",
      c: "bazz",
    });
  });

  it("deep", async () => {
    const merged = merge({
      foo: {
        fooBar: {
          fooBarBaz: "fooBarBaz" as const,
        },
      },
    }, {
      foo: {
        fooBar: {
          fooBarFoo: "fooBarFoo" as const,
        },
        fooBazz: {
          fooBazzBar: "fooBazBar" as const,
        },
      },
    });
    expect(merged).toStrictEqual({
      foo: {
        fooBar: {
          fooBarFoo: "fooBarFoo" as const,
          fooBarBaz: "fooBarBaz" as const,
        },
        fooBazz: {
          fooBazzBar: "fooBazBar" as const,
        },
      },
    });
  });

  it("overwrite undefined", async () => {
    const merged = merge({
      optional: undefined,
    }, {
      optional: "test",
    });
    expect(merged).toStrictEqual({
      optional: "test",
    });
  });

  it("undefined has low priority", async () => {
    const merged = merge({
      optional: "test",
    }, {
      optional: undefined,
    });
    expect(merged).toStrictEqual({
      optional: "test",
    });
  });

  it("null has low priority", async () => {
    const merged = merge({
      optional: "test",
    }, {
      optional: null,
    });
    expect(merged).toStrictEqual({
      optional: "test",
    });
  });

  it("function and obj", async () => {
    const merged = merge(
      () => "functionResult",
      {
        objParam: "objParam",
      },
    );
    expect(merged.objParam).toBe("objParam");
    expect(merged()).toBe("functionResult");
  });
  it("function and obj are reversible", async () => {
    const merged = merge(
      {
        objParam: "objParam",
      },
      () => "functionResult",
    );
    expect(merged.objParam).toBe("objParam");
    expect(merged()).toBe("functionResult");
  });

  it("some function", async () => {
    const merged = merge(
      () => "functionResult",
      () => "overwritedFunctionResult",
      (num: number) => num,
      (str: string) => `secondFunctionResult ${str}`,
    );
    expect(merged()).toBe("overwritedFunctionResult");
    expect(merged("str")).toBe("secondFunctionResult str");
    expect(merged(1)).toBe("secondFunctionResult 1");
  });

  it("array", async () => {
    const merged = merge(
      [1, 2, 3],
      () => "functionResult",
    );
    expect(merged()).toBe("functionResult");
    expect(merged[0]).toBe(1);
  });

  it("some array", async () => {
    const merged = merge(
      [1, 2, 3],
      [4, 5, 6, 7],
    );
    expect(merged[0]).toBe(4);
  });
});
