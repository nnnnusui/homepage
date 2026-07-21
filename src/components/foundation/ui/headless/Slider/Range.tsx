import { splitProps , ParentProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";

export const Range = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [p,wrappedProps] = splitProps(_p, ["as"]);

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? defaultAs}
    />
  );
};

const defaultAs = "div" as const;
