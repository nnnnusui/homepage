import { ParentProps, splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

export const Content = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps<{
  pos: Pos;
  size: Size;
}>>) => {
  const [p, wrappedProps] = splitProps(_p, ["pos", "size"]);
  const context = useGridContext();
  const state = Wve.from(() => context.state);

  const physicalPos = () => context.getViewportPhysicalPosFromViewportVirtualPos(context.getViewportVirtualPosFromCellPos(p.pos));
  const physicalSize = () => ({
    width: p.size.width * state().gridSize.width,
    height: p.size.height * state().gridSize.height,
  });

  return (
    <Polymorphic {...wrappedProps}
      as={wrappedProps.as ?? defaultAs}
      style={{
        position: "absolute",
        top: `${physicalPos().y}px`,
        left: `${physicalPos().x}px`,
        width: `${physicalSize().width}px`,
        height: `${physicalSize().height}px`,
        ...wrappedProps.style,
      }}
    />
  );
};

const defaultAs = "div" as const;
