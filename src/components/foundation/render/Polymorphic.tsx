import { ComponentProps, splitProps, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Override } from "~/type/Override";

export const Polymorphic = <As extends ValidComponent, Props>(_p: Override<
  PolymorphicProps<As, Props>,
  {
    as: Required<PolymorphicProps<As, Props>>["as"];
  }
>) => {
  const [p, wrappedProps] = splitProps(_p, ["as"]);
  return (
    // @ts-expect-error: may be valid.
    <Dynamic component={p.as} {...wrappedProps} />
  );
};

export type PolymorphicProps<As extends ValidComponent, Props> = Override<
  ComponentProps<As>,
  {
    as?: As; // | keyof JSX.HTMLElementTags;
  } & Props
>;
