import { Calc } from "~/fn/objCalc";
import { createElementSize } from "~/fn/state/createElementSize";
import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve, WveValue } from "~/type/struct/Wve";
import { GridContextProps } from "./Context";

export const useGrid = (p: {
  origin?: Pos | OriginTemplate;
  virtualPadding?: { top: number; right: number; bottom: number; left: number };
  initGridSize?: Size;
}) => {
  const virtualPadding = () => p.virtualPadding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const state: GridContextProps["state"] = Wve.create<WveValue<GridContextProps["state"]>>({
    gridSize: p.initGridSize ?? { width: 50, height: 20 },
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

  const originRatio = () => {
    if (p.origin === "top-left") return { x: 0, y: 0 };
    if (p.origin === "top-center") return { x: 0.5, y: 0 };
    if (p.origin === "top-right") return { x: 1, y: 0 };
    if (p.origin === "center-left") return { x: 0, y: 0.5 };
    if (p.origin === "center") return { x: 0.5, y: 0.5 };
    if (p.origin === "center-right") return { x: 1, y: 0.5 };
    if (p.origin === "bottom-left") return { x: 0, y: 1 };
    if (p.origin === "bottom-center") return { x: 0.5, y: 1 };
    if (p.origin === "bottom-right") return { x: 1, y: 1 };
    return p.origin ?? { x: 0, y: 0 };
  };

  const origin = () => Calc["*"](Pos.fromSize(state().viewportSize), originRatio());

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
  const getPhysicalScrollFromVirtualScroll = (from: Pos) => ({
    x: from.x - virtualScrollBorder().min.x,
    y: from.y - virtualScrollBorder().min.y,
  });
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

  return {
    state,
    get virtualSize() { return virtualSize(); },
    get virtualBorder() { return virtualBorder(); },
    get viewportOrigin() { return origin(); },
    get viewportOriginRatio() { return originRatio(); },
    get physicalScroll() { return Calc["-"](getViewportPhysicalPosFromViewportVirtualPos(state().scroll), origin()); },
    get virtualPointerPos() { return virtualPointerPos(); },
    getPhysicalScrollFromVirtualScroll,
    getViewportPhysicalPosFromViewportVirtualPos,
    getViewportVirtualPosFromViewportPhysicalPos,
    getVirtualScrollPosClamped,
    getViewportPhysicalPosClamped,
    getViewportVirtualPosClamped,
    getViewportVirtualPosFromCellPos,
    getCellPosFromViewportVirtualPos,
  };
};

type OriginTemplate
  = "top-left" | "top-center" | "top-right"
  | "center-left" | "center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right";
