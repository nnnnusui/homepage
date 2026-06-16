import { ComponentProps, ValidComponent } from "solid-js";

import { ButtonMain } from "./button-main";

export const ButtonRoot = <T extends ValidComponent = "button">(p: ComponentProps<typeof ButtonMain<T>>) => {

  return (
    <ButtonMain {...p} />
  );
};
