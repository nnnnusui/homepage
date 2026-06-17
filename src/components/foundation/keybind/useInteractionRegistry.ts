import { createEffect, createRoot, onCleanup, onMount } from "solid-js";

import { Objects } from "~/fn/objects";
import { Wve } from "~/type/struct/Wve";
import { KeybindAst } from "./KeybindAst";

const createInteractionRegistry = () => {
  const registry = Wve.create({
    nodes: {} as Record<InteractionNodeId, InteractionNode>,
    effects: {} as Record<InteractionNodeId, Record<InteractionLeafId, InteractionEffect>>,
    bindings: {} as Record<InteractionNodeId, Record<InteractionLeafId, InteractionBinding>>,
    latestEvent: undefined as InteractionInputEvent | undefined,
  });

  const getLatestActiveAt = (node: InteractionNode) => {
    return Math.max(node.focus || 0, node.hover || 0);
  };

  createEffect(() => {
    const latestActiveNodeId = Objects.keys(registry().nodes)
      .filter((id) => registry().nodes[id]?.focus || registry().nodes[id]?.hover)
      .reduce((prev, id) => {
        const currentNode = registry().nodes[id];
        if (!currentNode) return prev;
        const currentLatest = getLatestActiveAt(currentNode);
        if (prev.latestId && prev.latestAt >= currentLatest) return prev;
        return { latestId: id, latestAt: currentLatest };
      }, { latestId: "", latestAt: 0 })
      .latestId;
    if (!latestActiveNodeId) return;
    const latestActiveNode = registry().nodes[latestActiveNodeId];
    if (!latestActiveNode) return;
    const mayBeActiveNodeIds = latestActiveNode.idPath.split(".");
    const keybinds = mayBeActiveNodeIds.reduce((current, nodeId) => {
      const bindings = Objects.entries(registry().bindings[nodeId] ?? {})
        .map(([leafId, binding]) => ({ id: `${nodeId}.${leafId}`, binding }));
      if (!bindings) return current;
      if (current.length === 0) return bindings;
      return current.map((currentBind) => {
        return bindings.filter((it) => {
          if (!["Equal", "Subset", "Superset", "Overlap"].includes(KeybindAst.compare(currentBind.binding, it.binding).kind)) return false;
          return it;
        })[0] ?? currentBind;
      });
    }, [] as { id: string; binding: InteractionBinding }[]);
    console.log("active keybinds: ", keybinds);
    // mayBeActiveNodeIds
    //   .forEach((id) => console.log("active binding: ", id, registry().bindings[id]));
  });

  onMount(() => {
    const pointerDownListener = (e: PointerEvent) => registry.set("latestEvent", { type: "pointer.down", button: e.button });
    const pointerMoveListener = (e: PointerEvent) => registry.set("latestEvent", { type: "pointer.move", x: e.clientX, y: e.clientY });
    const pointerUpListener = (e: PointerEvent) => registry.set("latestEvent", { type: "pointer.up", button: e.button });
    const keyDownListener = (e: KeyboardEvent) => registry.set("latestEvent", { type: "key.down", key: e.key });
    const keyUpListener = (e: KeyboardEvent) => registry.set("latestEvent", { type: "key.up", key: e.key });

    window.addEventListener("pointerdown", pointerDownListener);
    window.addEventListener("pointermove", pointerMoveListener);
    window.addEventListener("pointerup", pointerUpListener);
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);

    onCleanup(() => {
      window.removeEventListener("pointerdown", pointerDownListener);
      window.removeEventListener("pointermove", pointerMoveListener);
      window.removeEventListener("pointerup", pointerUpListener);
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
    });
  });

  return () => registry;
};

export const useInteractionRegistry = createRoot(createInteractionRegistry);

export type InteractionNodeId = string;
export type InteractionLeafId = string;

export type InteractionBinding = KeybindAst; // legacy: ["pointer.down", "pointer.up"]
export type InteractionEffect = () => void;

export type InteractionInputEvent
  = | {
    type: "canceled";
  } | {
    type: "pointer.down";
    button: number;
  } | {
    type: "pointer.move";
    x: number;
    y: number;
  } | {
    type: "pointer.up";
    button: number;
  } | {
    type: "key.down";
    key: string;
  } | {
    type: "key.up";
    key: string;
  };

export type InteractionNode = {
  id: InteractionNodeId;
  idPath: string;
  focus: false | number;
  hover: false | number;
};
