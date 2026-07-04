import { ParentProps } from "solid-js";

import { cn } from "~/fn/cn";
import { Calc } from "~/fn/objCalc";
import { createElementSize } from "~/fn/state/createElementSize";
import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve, WveValue } from "~/type/struct/Wve";
import { GridContext, GridContextProps } from "./Context";

import styles from "./Root.module.css";

export const Root = (p: ParentProps<{
  origin?: ((viewportSize: Size) => Pos) | OriginTemplate;
  virtualPadding?: { top: number; right: number; bottom: number; left: number };
}>) => {
  const virtualPadding = () => p.virtualPadding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const state: GridContextProps["state"] = Wve.create<WveValue<GridContextProps["state"]>>({
    gridSize: { width: 50, height: 20 },
    virtualPadding: virtualPadding(),
    scroll: { x: 0, y: 0 },
    overscroll: { x: 0, y: 0 },
    pointer: { x: 0, y: 0 },
    viewportSize: { width: 0, height: 0 },
    viewportRef: undefined,
  });

  createElementSize(() => state().viewportRef, {
    setSize: (size) => state.set("viewportSize", size),
  });

  const origin = () => {
    if (p.origin === "top-left") return { x: 0, y: 0 };
    if (p.origin === "top-center") return { x: state().viewportSize.width / 2, y: 0 };
    if (p.origin === "top-right") return { x: state().viewportSize.width, y: 0 };
    if (p.origin === "center-left") return { x: 0, y: state().viewportSize.height / 2 };
    if (p.origin === "center") return { x: state().viewportSize.width / 2, y: state().viewportSize.height / 2 };
    if (p.origin === "center-right") return { x: state().viewportSize.width, y: state().viewportSize.height / 2 };
    if (p.origin === "bottom-left") return { x: 0, y: state().viewportSize.height };
    if (p.origin === "bottom-center") return { x: state().viewportSize.width / 2, y: state().viewportSize.height };
    if (p.origin === "bottom-right") return { x: state().viewportSize.width, y: state().viewportSize.height };
    return p.origin?.(state().viewportSize) ?? { x: 0, y: 0 };
  };

  const virtualSize = () => ({
    width: state().viewportSize.width + state().virtualPadding.left + state().virtualPadding.right,
    height: state().viewportSize.height + state().virtualPadding.top + state().virtualPadding.bottom,
  });
  const virtualScrollBorder = () => ({
    min: {
      x: state().virtualPadding.left ? 0 - state().virtualPadding.left : 0,
      y: state().virtualPadding.top ? 0 - state().virtualPadding.top : 0,
    },
    max: {
      x: state().virtualPadding.right ? state().virtualPadding.right : 0,
      y: state().virtualPadding.bottom ? state().virtualPadding.bottom : 0,
    },
  });
  const virtualBorder = () => ({
    min: Calc["-"](virtualScrollBorder().min, origin()),
    max: Calc["+"](virtualScrollBorder().max, Calc["-"](Pos.fromSize(state().viewportSize), origin())),
  });
  const physicalBorder = () => ({
    min: Pos.from({ x: 0, y: 0 }),
    max: Calc["-"](virtualBorder().max, virtualBorder().min),
  });
  const getVirtualScrollPosClamped = (from: Pos) =>
    Calc.max(virtualScrollBorder().min, Calc.min(from, virtualScrollBorder().max));
  const getViewportVirtualPosClamped = (from: Pos) =>
    Calc.max(virtualBorder().min, Calc.min(from, virtualBorder().max));
  const getViewportPhysicalPosClamped = (from: Pos) =>
    Calc.max(physicalBorder().min, Calc.min(from, physicalBorder().max));
  const getViewportPhysicalPosFromViewportVirtualPos = (from: Pos) => ({
    x: from.x - virtualScrollBorder().min.x + origin().x,
    y: from.y - virtualScrollBorder().min.y + origin().y,
  });
  const getViewportVirtualPosFromViewportPhysicalPos = (from: Pos) => ({
    x: from.x + virtualScrollBorder().min.x - origin().x,
    y: from.y + virtualScrollBorder().min.y - origin().y,
  });
  const getViewportVirtualPosFromCellPos = (from: Pos) => ({
    x: from.x * state().gridSize.width,
    y: from.y * state().gridSize.height,
  });
  const getCellPosFromViewportVirtualPos = (from: Pos) => ({
    x: from.x / state().gridSize.width,
    y: from.y / state().gridSize.height,
  });

  const virtualPointerPos = () => getViewportVirtualPosFromViewportPhysicalPos(state().pointer);

  return (
    <GridContext.Provider
      value={{
        state,
        get virtualSize() { return virtualSize(); },
        get viewportOrigin() { return origin(); },
        get physicalScroll() { return Calc["-"](getViewportPhysicalPosFromViewportVirtualPos(state().scroll), origin()); },
        getViewportPhysicalPosFromViewportVirtualPos,
        getViewportVirtualPosFromViewportPhysicalPos,
        getVirtualScrollPosClamped,
        getViewportPhysicalPosClamped,
        getViewportVirtualPosClamped,
        getViewportVirtualPosFromCellPos,
        getCellPosFromViewportVirtualPos,
      }}
    >
      <div class={cn(styles.GridRoot)}>
        <div class="absolute top-0 left-0 text-xs text-gray-500">
          <span>Virtual Size: {virtualSize().width.toFixed(2)}, {virtualSize().height.toFixed(2)}</span>
          <br />
          <span>Viewport Size: {state().viewportSize.width.toFixed(2)}, {state().viewportSize.height.toFixed(2)}</span>
          <br />
          <span>Origin: {origin().x.toFixed(2)}, {origin().y.toFixed(2)}</span>
          <br />
          <span>Scroll: {state().scroll.x.toFixed(2)}, {state().scroll.y.toFixed(2)}</span>
          <br />
          <span>Overscroll: {state().overscroll.x.toFixed(2)}, {state().overscroll.y.toFixed(2)}</span>
          <br />
          <span>Pointer: {virtualPointerPos().x.toFixed(2)}, {virtualPointerPos().y.toFixed(2)} ({state().pointer.x.toFixed(2)}, {state().pointer.y.toFixed(2)})</span>
          <br />
          <span>Virtual border: {virtualBorder().min.x.toFixed(2)}, {virtualBorder().min.y.toFixed(2)} - {virtualBorder().max.x.toFixed(2)}, {virtualBorder().max.y.toFixed(2)}</span>
          <br />
          <span>Physical border: {physicalBorder().min.x.toFixed(2)}, {physicalBorder().min.y.toFixed(2)} - {physicalBorder().max.x.toFixed(2)}, {physicalBorder().max.y.toFixed(2)}</span>
        </div>
        {p.children}
      </div>
    </GridContext.Provider>
  );
};

type OriginTemplate
  = "top-left" | "top-center" | "top-right"
  | "center-left" | "center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right";
