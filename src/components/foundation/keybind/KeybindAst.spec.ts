import { describe, expect, it } from "vitest";

import { KeybindAst , compareKeybindAst } from "./KeybindAst";

const leaf = (key: string): KeybindAst => KeybindAst.leaf({ key });
const or = (...children: KeybindAst[]): KeybindAst => KeybindAst.or(children);
const and = (...children: KeybindAst[]): KeybindAst => KeybindAst.and(children);
const serial = (...children: KeybindAst[]): KeybindAst => KeybindAst.serial(children);
const then_ = (...children: KeybindAst[]): KeybindAst => KeybindAst.then(children);
const decorate = (child: KeybindAst, priority?: number): KeybindAst => KeybindAst.decorate(child, { priority });

describe("compareKeybindAst", () => {
  describe("Equal", () => {
    it("returns Equal for identical leaf nodes", () => {
      expect(compareKeybindAst(leaf("A"), leaf("A"))).toStrictEqual({ kind: "Equal" });
    });

    it("returns Equal for identical composite nodes", () => {
      const lhs = and(leaf("Ctrl"), leaf("S"));
      const rhs = and(leaf("Ctrl"), leaf("S"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
    });

    it("treats decorate as transparent — decorated vs plain", () => {
      const lhs = decorate(leaf("A"));
      const rhs = leaf("A");
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
    });

    it("treats decorate as transparent on both sides", () => {
      const lhs = decorate(leaf("A"), 10);
      const rhs = decorate(leaf("A"), 99);
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
    });

    it("returns Equal for identical or nodes", () => {
      const lhs = or(leaf("A"), leaf("B"));
      const rhs = or(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
    });

    it("returns Equal for identical serial nodes", () => {
      const lhs = serial(leaf("A"), leaf("B"));
      const rhs = serial(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
    });

    it("returns Equal for identical then nodes", () => {
      const lhs = then_(leaf("A"), leaf("B"));
      const rhs = then_(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
    });

    describe("or equality", () => {
      it("returns Equal for or nodes with same alternatives in different order", () => {
        const lhs = or(leaf("A"), leaf("B"));
        const rhs = or(leaf("B"), leaf("A"));
        expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
      });

      it("The consistency of 'or' nodes allows for reordering even within nested structures.", () => {
        const lhs = or(and(or(leaf("A"), leaf("AA")), leaf("B")), leaf("C"));
        const rhs = or(and(or(leaf("AA"), leaf("A")), leaf("B")), leaf("C"));
        expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
      });

      it("The consistency of 'or' nodes allows for permutation even when nested.", () => {
        const lhs = or(leaf("C"), and(or(leaf("A"), leaf("AA")), leaf("B")));
        const rhs = or(and(or(leaf("AA"), leaf("A")), leaf("B")), leaf("C"));
        expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
      });
    });
  });

  describe("Disjoint", () => {
    it("returns Disjoint for completely different leaves", () => {
      expect(compareKeybindAst(leaf("A"), leaf("B"))).toStrictEqual({ kind: "Disjoint" });
    });

    it("returns Disjoint when or-alternatives share no elements", () => {
      const lhs = or(leaf("A"), leaf("B"));
      const rhs = or(leaf("C"), leaf("D"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Disjoint" });
    });

    it("returns Disjoint for different composite node types", () => {
      expect(compareKeybindAst(and(leaf("A"), leaf("B")), serial(leaf("A"), leaf("B")))).toStrictEqual({ kind: "Disjoint" });
    });
  });

  describe("Subset", () => {
    it("returns Subset when lhs or-set contains all rhs alternatives (equal priority)", () => {
      const lhs = or(leaf("A"), leaf("B"));
      const rhs = leaf("A");
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Subset" });
    });

    it("returns Subset when lhs or-set contains all rhs alternatives (lhs has higher priority)", () => {
      // rhs has lower priority than lhs, so not Unreachable
      const lhs = or(leaf("A"), leaf("B"));
      const rhs = decorate(leaf("A"), -1);
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Subset" });
    });

    it("returns Subset for nested or within lhs", () => {
      const lhs = or(leaf("A"), leaf("B"), leaf("C"));
      const rhs = or(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Subset" });
    });

    describe("or Subset", () => {
      it("returns Subset when lhs has more alternatives", () => {
        const lhs = or(leaf("A"), leaf("B"), leaf("C"));
        const rhs = or(leaf("B"), leaf("A"));
        expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Subset" });
      });

      it("returns Subset when lhs has more nested or alternatives", () => {
        const lhs = or(and(or(leaf("A"), leaf("AA"), leaf("AAA")), leaf("B")), leaf("C"));
        const rhs = or(and(or(leaf("AA"), leaf("A")), leaf("B")), leaf("C"));
        expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Subset" });
      });

      it("returns Subset when nested or differences cancel out after flattening", () => {
        const lhs = or(leaf("C"), and(or(leaf("A"), leaf("AA"), leaf("AAA")), leaf("B")));
        const rhs = or(and(or(leaf("AA"), leaf("A")), leaf("B")), leaf("C"));
        expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Subset" });
      });
    });
  });

  describe("Superset", () => {
    it("returns Superset when rhs or-set contains all lhs alternatives and lhs has higher priority", () => {
      const lhs = decorate(leaf("A"), 10);
      const rhs = or(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Superset" });
    });

    it("returns Superset when lhs priority strictly exceeds rhs priority", () => {
      // flattenOr does not unwrap decorate, so rhs must be a plain or node
      const lhs = decorate(leaf("A"), 5);
      const rhs = or(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Superset" });
    });
  });

  describe("Unreachable", () => {
    it("returns Unreachable when lhs is a superset but rhs has higher priority", () => {
      const lhs = or(leaf("A"), leaf("B"));
      const rhs = decorate(leaf("A"), 1);
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({
        kind: "Unreachable",
        reason: "rhs has higher priority while lhs structurally covers rhs",
      });
    });

    it("returns Unreachable when lhs is a subset and rhs priority is equal (default 0)", () => {
      const lhs = leaf("A");
      const rhs = or(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({
        kind: "Unreachable",
        reason: "lhs is shadowed by rhs in declaration set",
      });
    });

    it("returns Unreachable when lhs is a subset and lhs has lower priority than rhs", () => {
      // flattenOr does not unwrap decorate, so rhs must be a plain or node;
      // rhs default priority (0) is >= lhs negative priority
      const lhs = decorate(leaf("A"), -1);
      const rhs = or(leaf("A"), leaf("B"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({
        kind: "Unreachable",
        reason: "lhs is shadowed by rhs in declaration set",
      });
    });
  });

  describe("Ambiguous", () => {
    it("returns Ambiguous when or-sets partially overlap", () => {
      const lhs = or(leaf("A"), leaf("B"));
      const rhs = or(leaf("B"), leaf("C"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({
        kind: "Ambiguous",
        reason: "definitions overlap partially but neither contains the other",
      });
    });

    it("returns Ambiguous for partial overlap with three alternatives", () => {
      const lhs = or(leaf("A"), leaf("B"), leaf("C"));
      const rhs = or(leaf("C"), leaf("D"), leaf("E"));
      expect(compareKeybindAst(lhs, rhs)).toStrictEqual({
        kind: "Ambiguous",
        reason: "definitions overlap partially but neither contains the other",
      });
    });
  });
});
