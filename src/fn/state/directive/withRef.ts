import { UseRef } from "./chainUseDirective";

/** @public */
export const withRef = <Element extends HTMLElement = HTMLElement>(
  assign: (ref: Element) => void,
): UseRef<Element> => (ref) => {
  assign(ref);
};
