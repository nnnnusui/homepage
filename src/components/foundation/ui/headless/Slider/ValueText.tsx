import { splitProps , ParentProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { useSliderContext } from "./createSlider";

export const ValueText = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [p,wrappedProps] = splitProps(_p, ["as"]);
  const context = useSliderContext();

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? defaultAs}
    >
      {context.state().value.toFixed(context.digits)}
    </Polymorphic>
  );
};

const defaultAs = "span" as const;
