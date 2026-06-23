import { UseRef } from "~/fn/chainUseRef";

/** @public */
export const withRef = <Element extends HTMLElement = HTMLElement>(
  assign: (ref: Element) => void,
): UseRef<Element> => (ref) => {
  assign(ref);
};
