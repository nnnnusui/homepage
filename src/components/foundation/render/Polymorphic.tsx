import { ComponentProps, ParentProps, Show, splitProps, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Override } from "~/type/Override";

/** @public */
export const Polymorphic = <As extends PolymorphicAs, Props>(_p: Override<
  PolymorphicProps<As, Props>,
  {
    as: Required<PolymorphicProps<As, Props>>["as"] | undefined;
  }
>) => {
  const [p, wrappedProps] = splitProps(_p, ["as"]);
  return (
    // @ts-expect-error: may be valid.
    <Show when={!p.as} fallback={<Dynamic component={p.as} {...wrappedProps} />}>
      <>{(wrappedProps as ParentProps).children}</>
    </Show>
  );
};

/** @public */
export type PolymorphicProps<As extends PolymorphicAs, Props> = Override<
  As extends ValidComponent ? ComponentProps<As> : ParentProps,
  {
    as?: As; // | keyof JSX.HTMLElementTags;
  } & Props
>;

/** @public */
export type PolymorphicAs = ValidComponent | undefined;
