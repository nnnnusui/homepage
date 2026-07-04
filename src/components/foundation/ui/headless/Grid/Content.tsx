import { ParentProps } from "solid-js";

import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

export const Content = (p: ParentProps<{
  pos: Pos;
  size: Size;
}>) => {
  const context = useGridContext();
  const state = Wve.from(() => context.state);

  const physicalPos = () => context.getViewportPhysicalPosFromViewportVirtualPos(context.getViewportVirtualPosFromCellPos(p.pos));
  const physicalSize = () => ({
    width: p.size.width * state().gridSize.width,
    height: p.size.height * state().gridSize.height,
  });

  return (
    <div class="bg-amber-700"
      style={{
        position: "absolute",
        top: `${physicalPos().y}px`,
        left: `${physicalPos().x}px`,
        width: `${physicalSize().width}px`,
        height: `${physicalSize().height}px`,
      }}
    />
  );
};
