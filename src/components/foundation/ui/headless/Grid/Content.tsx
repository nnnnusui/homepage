import { ParentProps, splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

export const Content = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps<{
  pos: Pos;
  size: { width: number | "full"; height: number | "full" };
}>>) => {
  const [p, wrappedProps] = splitProps(_p, ["pos", "size"]);
  const context = useGridContext();
  const state = Wve.from(() => context.state);

  const physicalPos = () => context.getViewportPhysicalPosFromViewportVirtualPos(context.getViewportVirtualPosFromCellPos(p.pos));
  const styleMap = () => ({
    top: p.size.height === "full" ? "0px" : `${physicalPos().y}px`,
    left: p.size.width === "full" ? "0px" : `${physicalPos().x}px`,
    width: p.size.width === "full" ? "100%" : `${p.size.width * state().gridSize.width}px`,
    height: p.size.height === "full" ? "100%" : `${p.size.height * state().gridSize.height}px`,
  });

  return (
    <Polymorphic {...wrappedProps}
      as={wrappedProps.as ?? defaultAs}
      style={{
        position: "absolute",
        top: styleMap().top,
        left: styleMap().left,
        width: styleMap().width,
        height: styleMap().height,
        ...wrappedProps.style,
      }}
    />
  );
};

const defaultAs = "div" as const;
