import { ComponentProps, ValidComponent } from "solid-js";

import { InteractionProvider } from "~/components/foundation/keybind/InteractionContext";
import { ButtonMain } from "./button-main";

export const ButtonRoot = <T extends ValidComponent = "button">(p: ComponentProps<typeof ButtonMain<T>>) => {

  return (
    <InteractionProvider id="button">
      <ButtonMain {...p} />
    </InteractionProvider>
  );
};
