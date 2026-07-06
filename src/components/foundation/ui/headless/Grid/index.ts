import { Background } from "./Background";
import { Content } from "./Content";
import { GridContext } from "./Context";
import { Debug } from "./Debug";
import { Header } from "./Header";
import { Root } from "./Root";
import { Viewport } from "./Viewport";

/** @public */
export const Grid = Object.assign(Root, {
  RootProvider: GridContext.Provider,
  Viewport,
  Background,
  Content,
  Header,
  Debug,
});

/** @public */
export { useGrid } from "./useGrid";
