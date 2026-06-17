import { describe, expect, it } from "vitest";

import { compareKeybindAst, fromLegacyBinding, InteractionKeybindAst } from "./InteractionBinding";

describe("InteractionBinding", async () => {
  it("treats normalized equal bindings as Equal", async () => {
    const lhs: InteractionKeybindAst = {
      type: "and",
      children: [
        { type: "leaf", input: { kind: "keydown", key: "A", modifiers: ["Shift", "Ctrl", "Ctrl"] } },
        { type: "leaf", input: { kind: "pointerdown" } },
      ],
    };

    const rhs: InteractionKeybindAst = {
      type: "and",
      children: [
        { type: "leaf", input: { kind: "pointerdown" } },
        { type: "leaf", input: { kind: "keydown", key: "A", modifiers: ["Ctrl", "Shift"] } },
      ],
    };

    expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Equal" });
  });

  it("classifies set inclusion through top-level Or as Superset/Subset", async () => {
    const click: InteractionKeybindAst = fromLegacyBinding(["pointer.down", "pointer.up"]);
    const enter: InteractionKeybindAst = fromLegacyBinding(["keyboard.enter.down", "keyboard.enter.up"]);

    const lhs: InteractionKeybindAst = {
      type: "or",
      children: [click, enter],
    };

    expect(compareKeybindAst(lhs, click)).toStrictEqual({ kind: "Superset" });
    expect(compareKeybindAst(click, lhs)).toStrictEqual({ kind: "Subset" });
  });

  it("returns Disjoint when there is no overlap", async () => {
    const lhs = fromLegacyBinding(["keyboard.space.down", "keyboard.space.up"]);
    const rhs = fromLegacyBinding(["pointer.down", "pointer.up"]);

    expect(compareKeybindAst(lhs, rhs)).toStrictEqual({ kind: "Disjoint" });
  });
});
