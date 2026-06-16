import { splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";

export const ButtonMain = <T extends ValidComponent = "button">(_p: PolymorphicProps<T, {
  onApply: () => void;
}>) => {
  const [p, wrappedProps] = splitProps(_p, ["as", "onApply"]);

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? "button"}
      onClick={p.onApply}
    />
  );
};
