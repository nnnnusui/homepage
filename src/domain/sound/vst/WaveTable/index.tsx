import { ParentProps, untrack } from "solid-js";

import { createWaveTable, WaveTableContext } from "./createWaveTable";
import { Editor } from "./Editor";
import { Player } from "./Player";
import { View2D } from "./View2D";
import { View3D } from "./View3D";

const Root = (p: ParentProps<Parameters<typeof createWaveTable>[0] | { api: ReturnType<typeof createWaveTable> }>) => {
  const api = "api" in p ? untrack(() => p.api) : createWaveTable(p);

  return (
    <WaveTableContext.Provider value={api}>
      {p.children}
    </WaveTableContext.Provider>
  );
};

/** @public */
export const WaveTable = Object.assign(Root, {
  View3D,
  View2D,
  Player,
  Editor,
});

/** @public */
export { createWaveTable, useWaveTableContext } from "./createWaveTable";
