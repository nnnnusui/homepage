import { createContext, useContext } from "solid-js";

import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve } from "~/type/struct/Wve";

export type GridContextProps = {
  state: Wve<{
    gridSize: Size;
    virtualPadding: { top: number; right: number; bottom: number; left: number };
    scroll: Pos;
    overscroll: Pos;
    pointer: Pos;
    viewportSize: Size;
    viewportRef: HTMLElement | undefined;
  }>;
  virtualSize: Size;
  viewportOrigin: Pos;
  physicalScroll: Pos;
  getViewportPhysicalPosFromViewportVirtualPos: (from: Pos) => Pos;
  getViewportVirtualPosFromViewportPhysicalPos: (from: Pos) => Pos;
  getViewportPhysicalPosClamped: (from: Pos) => Pos;
  getViewportVirtualPosClamped: (from: Pos) => Pos;
  getVirtualScrollPosClamped: (from: Pos) => Pos;
  getViewportVirtualPosFromCellPos: (from: Pos) => Pos;
  getCellPosFromViewportVirtualPos: (from: Pos) => Pos;
};
export const GridContext = createContext<GridContextProps>();

export const useGridContext = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error("Grid context is not available");
  }
  return context;
};
