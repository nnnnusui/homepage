import { ComponentProps, splitProps, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Override } from "~/type/Override";

export const Polymorphic = <T extends ValidComponent, Props>(_p: Override<
  PolymorphicProps<T, Props>,
  {
    as: Required<PolymorphicProps<T, Props>>["as"];
  }
>) => {
  const [p, wrappedProps] = splitProps(_p, ["as"]);
  return (
    // @ts-expect-error: may be valid.
    <Dynamic component={p.as} {...wrappedProps} />
  );
};

export type PolymorphicProps<T extends ValidComponent, Props> = Override<
  ComponentProps<T>,
  {
    as?: T; // | keyof JSX.HTMLElementTags;
  } & Props
>;
