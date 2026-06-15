import { Accessor } from "solid-js";

/** @public */
export type UseRef<Element extends HTMLElement = HTMLElement>
  = (ref: Element) => void;

/** @public */
export type UseDirective = <
  Element extends HTMLElement = HTMLElement,
  Props extends Accessor<unknown> = Accessor<unknown>,
>(ref: Element, p: Props) => void;

/** @public */
export const chainUseDirective = <Element extends HTMLElement = HTMLElement>(
  directives: readonly UseRef<Element>[],
) => (ref: Element) => {
  directives.forEach((directive) => {
    directive(ref);
  });
};
