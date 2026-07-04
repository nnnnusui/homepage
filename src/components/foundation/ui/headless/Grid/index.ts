import { Content } from "./Content";
import { Header } from "./Header";
import { Root } from "./Root";
import { Viewport } from "./Viewport";

export const Grid = Object.assign(Root, {
  Viewport,
  Content,
  Header,
});
