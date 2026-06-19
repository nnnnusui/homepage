import { ParentProps, createContext, createUniqueId, onCleanup, useContext } from "solid-js";

import { InteractionBinding, InteractionLeafId, InteractionNodeId, useInteractionRegistry } from "./useInteractionRegistry";

const InteractionContext = createContext<{
  nodeIdPath: InteractionNodeId;
}>({
  nodeIdPath: "",
});

/** @public */
export const InteractionProvider = (p: ParentProps<{
  id?: string;
}>) => {
  const context = useContext(InteractionContext);
  const newId = createUniqueId();
  const nodeIdPath = () => [context.nodeIdPath, newId].filter(Boolean).join(".");
  // const commandPath = () => [context.commandPath, p.id].filter(Boolean).join(".");

  return (
    <InteractionContext.Provider
      value={{
        get nodeIdPath() { return nodeIdPath();},
        // get commandPath() { return commandPath(); },
      }}
    >
      {p.children}
    </InteractionContext.Provider>
  );
};

/** @public */
export const useInteractionContext = () => {
  const registry = useInteractionRegistry();
  const context = useContext(InteractionContext);
  const nodeIdPaths = () => context.nodeIdPath.split(".");
  const nodeId = () => nodeIdPaths().slice(-1)[0]!;

  const register = (p: {
    id: InteractionLeafId;
    binding: InteractionBinding;
    execute: () => void;
  }) => {
    registry.set("nodes", nodeId(), {
      id: nodeId(),
      idPath: context.nodeIdPath,
    });
    registry.set("effects", nodeId(), (prev) => ({
      ...prev,
      [p.id]: p.execute,
    }));
    registry.set("bindings", nodeId(), (prev) => ({
      ...prev,
      [p.id]: p.binding,
    }));

    onCleanup(() => {
      registry.set("nodes", nodeId(), undefined!);
      registry.set("effects", nodeId(), p.id, undefined!);
      registry.set("bindings", nodeId(), p.id, undefined!);
    });
  };

  const props = () => ({
    // onFocus: (e: FocusEvent) => { (e.currentTarget as HTMLElement).style.outline = "2px dotted blue"; registry.set("nodes", nodeId(), "focus", Date.now()); },
    // onBlur: (e: FocusEvent) => { (e.currentTarget as HTMLElement).style.outline = ""; registry.set("nodes", nodeId(), "focus", false); },
    // onPointerEnter: (e: PointerEvent) => { (e.currentTarget as HTMLElement).style.outline = "2px dotted red"; registry.set("nodes", nodeId(), "hover", Date.now()); },
    // onPointerLeave: (e: PointerEvent) => { (e.currentTarget as HTMLElement).style.outline = ""; registry.set("nodes", nodeId(), "hover", false); },
  });

  return {
    get id() { return nodeId(); },
    register,
    props,
  };
};
