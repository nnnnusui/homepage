import { JSX } from "solid-js";

export type HtmlEvent<E extends Event, T = HTMLElement> = Parameters<JSX.EventHandler<T, E>>[0]
