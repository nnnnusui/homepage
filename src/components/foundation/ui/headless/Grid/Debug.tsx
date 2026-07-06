import { ParentProps, splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { cn } from "~/fn/cn";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

export const Debug = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [, wrappedProps] = splitProps(_p, []);
  const context = useGridContext();
  const state = Wve.from(() => context.state);

  return (
    <Polymorphic {...wrappedProps}
      as={wrappedProps.as ?? defaultAs}
      class={cn("absolute top-0 left-0 text-xs text-gray-500", wrappedProps.class)}
    >
      <span>Virtual Size: {context.virtualSize.width.toFixed(2)}, {context.virtualSize.height.toFixed(2)}</span>
      <br />
      <span>Viewport Size: {state().viewportSize.width.toFixed(2)}, {state().viewportSize.height.toFixed(2)}</span>
      <br />
      <span>Origin: {context.viewportOrigin.x.toFixed(2)}, {context.viewportOrigin.y.toFixed(2)}</span>
      <br />
      <span>Scroll: {state().scroll.x.toFixed(2)}, {state().scroll.y.toFixed(2)}</span>
      <br />
      <span>Overscroll: {state().overscroll.x.toFixed(2)}, {state().overscroll.y.toFixed(2)}</span>
      {/* <br />
        <span>Pointer: {virtualPointerPos().x.toFixed(2)}, {virtualPointerPos().y.toFixed(2)} ({state().pointer.x.toFixed(2)}, {state().pointer.y.toFixed(2)})</span>
        <br />
        <span>Virtual border: {virtualBorder().min.x.toFixed(2)}, {virtualBorder().min.y.toFixed(2)} - {virtualBorder().max.x.toFixed(2)}, {virtualBorder().max.y.toFixed(2)}</span>
        <br />
        <span>Physical border: {physicalBorder().min.x.toFixed(2)}, {physicalBorder().min.y.toFixed(2)} - {physicalBorder().max.x.toFixed(2)}, {physicalBorder().max.y.toFixed(2)}</span> */}
      {wrappedProps.children}
    </Polymorphic>
  );
};

const defaultAs = "div" as const;
