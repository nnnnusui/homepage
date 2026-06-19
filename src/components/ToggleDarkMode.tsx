import { cn } from "~/fn/cn";
import { useTheme } from "~/fn/state/root/useTheme";
import { ButtonStyled } from "./foundation/ui/ButtonStyled";

import styles from "./ToggleDarkMode.module.css";

export const ToggleDarkMode = () => {
  const theme = useTheme();
  const darkMode = () => theme.darkMode;

  return (
    <ButtonStyled class={cn(styles.ToggleDarkMode, "p-4")}
      onApply={() => theme.toggleDarkMode()}
      pressed={!darkMode()}
    >
      <div class={cn(styles.Icon, !darkMode() && styles.LightMode, "m-1")} />
    </ButtonStyled>
  );
};
