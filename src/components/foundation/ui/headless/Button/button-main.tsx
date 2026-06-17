import { splitProps, ValidComponent } from "solid-js";

import { useInteractionContext } from "~/components/foundation/keybind/InteractionContext";
import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";

export const ButtonMain = <T extends ValidComponent = "button">(_p: PolymorphicProps<T, {
  onApply: () => void;
}>) => {
  const [p, wrappedProps] = splitProps(_p, ["as", "onApply"]);
  const interaction = useInteractionContext();

  interaction.register({
    id: "click",
    binding: [
      "pointer.down",
      "pointer.up",
    ],
    execute: () => p.onApply(),
  });

  interaction.register({
    id: "keyboard-space",
    binding: [
      "keyboard.space.down",
      "keyboard.space.up",
    ],
    execute: () => p.onApply(),
  });

  interaction.register({
    id: "keyboard-enter",
    binding: [
      "keyboard.enter.down",
      "keyboard.enter.up",
    ],
    execute: () => p.onApply(),
  });

  return (
    <Polymorphic {...wrappedProps}
      {...interaction.props()}
      as={p.as ?? "button"}
      onClick={p.onApply}
    />
  );
};
