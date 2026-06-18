import { describe, expect, it, expectTypeOf } from "vitest";

import { zip, Zipped, ZippedOnce } from "./zip";

describe("fn zip()", async () => {
  it("returns zipped rows for equal length arrays", async () => {
    const actual = zip({ mode: "strict" }, [1, 2], ["a", "b"], [true, false]);

    expect(actual).toEqual([
      [1, "a", true],
      [2, "b", false],
    ]);
  });

  it("shortest mode uses minimum length", async () => {
    const actual = zip({ mode: "shortest" }, [1], ["a", "b"]);

    expect(actual).toEqual([
      [1, "a"],
    ]);
  });

  it("longest mode fills missing items with undefined", async () => {
    const actual = zip({ mode: "longest" }, [1] as const, ["a", "b"] as const, [true] as const);

    expect(actual).toEqual([
      [1, "a", true],
      [undefined, "b", undefined],
    ]);
  });

  it("returns empty array when no arrays are provided", async () => {
    expect(zip({ mode: "strict" })).toEqual([]);
  });
});

describe("type Zipped", async () => {
  it("empty", async () => {
    type It = Zipped<[[], [], []], { mode: "shortest" }>;

    expectTypeOf<It>().toEqualTypeOf<[]>();
  });
  it ("once", async () => {
    type It = Zipped<[[1], ["a"], ["A"]], { mode: "shortest" }>;

    expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"]]>();
  });

  describe("[tuple, tuple]", async () => {
    describe("same length", async () => {
      it("strict", async () => {
        type It = Zipped<[[1, 2], ["a", "b"], ["A", "B"]], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [2, "b", "B"]]>();
      });

      it("shortest", async () => {
        type It = Zipped<[[1, 2], ["a", "b"], ["A", "B"]], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [2, "b", "B"]]>();
      });

      it("longest", async () => {
        type It = Zipped<[[1, 2], ["a", "b"], ["A", "B"]], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [2, "b", "B"]]>();
      });
    });

    describe("lhs shorter", async () => {
      it("strict", async () => {
        type It = Zipped<[[1], ["a", "b"], ["A", "B"]], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], "TypeError"]>();
      });

      it("shortest", async () => {
        type It = Zipped<[[1], ["a", "b"], ["A", "B"]], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"]]>();
      });

      it("longest", async () => {
        type It = Zipped<[[1], ["a", "b"], ["A", "B"]], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [undefined, "b", "B"]]>();
      });
    });

    describe("rhs shorter", async () => {
      it("strict", async () => {
        type It = Zipped<[[1, 2], ["a"], ["A"]], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], "TypeError"]>();
      });

      it("shortest", async () => {
        type It = Zipped<[[1, 2], ["a"], ["A"]], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"]]>();
      });

      it("longest", async () => {
        type It = Zipped<[[1, 2], ["a"], ["A"]], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [2]]>();
      });
    });

    describe("middle shorter", async () => {
      it("strict", async () => {
        type It = Zipped<[[1, 2], ["a"], ["A", "B"]], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [2, "TypeError"]]>();
      });

      it("shortest", async () => {
        type It = Zipped<[[1, 2], ["a"], ["A", "B"]], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"]]>();
      });

      it("longest", async () => {
        type It = Zipped<[[1, 2], ["a"], ["A", "B"]], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [2, undefined, "B"]]>();
      });
    });

    describe("both side shorter", async () => {
      it("strict", async () => {
        type It = Zipped<[[1], ["a", "b"], ["A"]], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], "TypeError"]>();
      });

      it("shortest", async () => {
        type It = Zipped<[[1], ["a", "b"], ["A"]], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"]]>();
      });

      it("longest", async () => {
        type It = Zipped<[[1], ["a", "b"], ["A"]], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a", "A"], [undefined, "b"]]>();
      });
    });
  });

  describe("[array, tuple]", async () => {
    it("strict", async () => {
      type It = Zipped<[number[], ["a", "b"], ["A", "B"]], { mode: "strict" }>;

      expectTypeOf<It>().toEqualTypeOf<[[number, "a", "A"], [number, "b", "B"], "TypeError"]>();
    });

    it("shortest", async () => {
      type It = Zipped<[number[], ["a", "b"], ["A", "B"]], { mode: "shortest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[number, "a", "A"], [number, "b", "B"]]>();
    });

    it("longest", async () => {
      type It = Zipped<[number[], ["a", "b"], ["A", "B"]], { mode: "longest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[number, "a", "A"], [number, "b", "B"], ...[number][]]>();
    });
  });

  describe("[tuple, array]", async () => {
    it("strict", async () => {
      type It = Zipped<[[1, 2], string[], boolean[]], { mode: "strict" }>;

      expectTypeOf<It>().toEqualTypeOf<[[1, string, boolean], [2, string, boolean], "TypeError"]>();
    });

    it("shortest", async () => {
      type It = Zipped<[[1, 2], string[], boolean[]], { mode: "shortest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[1, string, boolean], [2, string, boolean]]>();
    });

    it("longest", async () => {
      type It = Zipped<[[1, 2], string[], boolean[]], { mode: "longest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[1, string, boolean], [2, string, boolean], ...[undefined, string, boolean][]]>();
    });
  });

  describe("[array, array]", async () => {
    it("strict", async () => {
      type It = Zipped<[number[], string[], boolean[]], { mode: "strict" }>;

      expectTypeOf<It>().toEqualTypeOf<[number, string, boolean][]>();
    });

    it("shortest", async () => {
      type It = Zipped<[number[], string[], boolean[]], { mode: "shortest" }>;

      expectTypeOf<It>().toEqualTypeOf<[number, string, boolean][]>();
    });

    it("longest", async () => {
      type It = Zipped<[number[], string[], boolean[]], { mode: "longest" }>;

      expectTypeOf<It>().toEqualTypeOf<[number, string, boolean][]>();
    });
  });
});

describe("type ZippedOnce", async () => {
  it("empty", async () => {
    type It = ZippedOnce<[], [], { mode: "shortest" }>;

    expectTypeOf<It>().toEqualTypeOf<[]>();
  });
  it("once", async () => {
    type It = ZippedOnce<[1], ["a"], { mode: "shortest" }>;

    expectTypeOf<It>().toEqualTypeOf<[[1, "a"]]>();
  });

  describe("[tuple, tuple]", async () => {
    describe("same length", async () => {
      it("strict", async () => {
        type It = ZippedOnce<[1, 2], ["a", "b"], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], [2, "b"]]>();
      });

      it("shortest", async () => {
        type It = ZippedOnce<[1, 2], ["a", "b"], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], [2, "b"]]>();
      });

      it("longest", async () => {
        type It = ZippedOnce<[1, 2], ["a", "b"], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], [2, "b"]]>();
      });
    });

    describe("lhs shorter", async () => {
      it("strict", async () => {
        type It = ZippedOnce<[1], ["a", "b"], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], "TypeError"]>();
      });

      it("shortest", async () => {
        type It = ZippedOnce<[1], ["a", "b"], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"]]>();
      });

      it("longest", async () => {
        type It = ZippedOnce<[1], ["a", "b"], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], [undefined, "b"]]>();
      });
    });

    describe("rhs shorter", async () => {
      it("strict", async () => {
        type It = ZippedOnce<[1, 2], ["a"], { mode: "strict" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], "TypeError"]>();
      });

      it("shortest", async () => {
        type It = ZippedOnce<[1, 2], ["a"], { mode: "shortest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"]]>();
      });

      it("longest", async () => {
        type It = ZippedOnce<[1, 2], ["a"], { mode: "longest" }>;

        expectTypeOf<It>().toEqualTypeOf<[[1, "a"], [2]]>();
      });
    });
  });

  describe("[array, tuple]", async () => {
    it("strict", async () => {
      type It = ZippedOnce<number[], ["a", "b"], { mode: "strict" }>;

      expectTypeOf<It>().toEqualTypeOf<[[number, "a"], [number, "b"], "TypeError"]>();
    });

    it("shortest", async () => {
      type It = ZippedOnce<number[], ["a", "b"], { mode: "shortest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[number, "a"], [number, "b"]]>();
    });

    it("longest", async () => {
      type It = ZippedOnce<number[], ["a", "b"], { mode: "longest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[number, "a"], [number, "b"], ...[number][]]>();
    });
  });

  describe("[tuple, array]", async () => {
    it("strict", async () => {
      type It = ZippedOnce<[1, 2], string[], { mode: "strict" }>;

      expectTypeOf<It>().toEqualTypeOf<[[1, string], [2, string], "TypeError"]>();
    });

    it("shortest", async () => {
      type It = ZippedOnce<[1, 2], string[], { mode: "shortest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[1, string], [2, string]]>();
    });

    it("longest", async () => {
      type It = ZippedOnce<[1, 2], string[], { mode: "longest" }>;

      expectTypeOf<It>().toEqualTypeOf<[[1, string], [2, string], ...[undefined, string][]]>();
    });
  });

  describe("[array, array]", async () => {
    it("strict", async () => {
      type It = ZippedOnce<number[], string[], { mode: "strict" }>;

      expectTypeOf<It>().toEqualTypeOf<[number, string][]>();
    });

    it("shortest", async () => {
      type It = ZippedOnce<number[], string[], { mode: "shortest" }>;

      expectTypeOf<It>().toEqualTypeOf<[number, string][]>();
    });

    it("longest", async () => {
      type It = ZippedOnce<number[], string[], { mode: "longest" }>;

      expectTypeOf<It>().toEqualTypeOf<[number, string][]>();
    });
  });
});
