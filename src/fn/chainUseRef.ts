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
export const chainUseRef = <Element extends HTMLElement = HTMLElement>(
  directives: readonly (Element | UseRef<Element> | undefined)[],
) => (ref: Element) => {
  directives.forEach((directive) => {
    // A prop-passed `let ref` is also represented as a callable ref handler.
    (directive as UseRef<Element>)?.(ref);
  });
};
