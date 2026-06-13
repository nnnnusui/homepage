import { Component, ComponentProps } from "solid-js";

import { HeadlessProps } from "./HeadlessProps";

/** @public */
export type StyledProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends Component<any>,
> = ComponentProps<C> extends HeadlessProps<infer T>
  ? T
  : never;
