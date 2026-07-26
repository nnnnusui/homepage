import { createEffect, createRoot } from "solid-js";

import { Hsl } from "~/type/struct/Hsl";
import { Rgb } from "~/type/struct/Rgb";
import { Wve } from "~/type/struct/Wve";

const darkModeStorageKey = "theme.darkMode";

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return true;

  const saved = window.localStorage.getItem(darkModeStorageKey);
  if (saved === "true") return true;
  if (saved === "false") return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
};

const persistAndApplyDarkMode = (darkMode: boolean) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(darkModeStorageKey, String(darkMode));
  document.documentElement.classList.toggle("light", !darkMode);
  document.documentElement.classList.toggle("dark", darkMode);
};

const createTheme = () => {
  const state = Wve.create({
    base: Hsl.fromRgb(Rgb.fromRgbHexStr("#181818")),
    main: Hsl.fromRgb(Rgb.fromRgbHexStr("#b1b1b1")),
    accent: Hsl.fromRgb(Rgb.fromRgbHexStr("#cc3232")),
    darkMode: getInitialDarkMode(),
  });
  const darkMode = () => state().darkMode;

  createEffect(() => {
    persistAndApplyDarkMode(darkMode());
  });

  const toggleDarkMode = () => {
    state.set("darkMode", (prev) => !prev);
  };
  const getModeColor = (baseHsl: Hsl, darkMode: boolean) => {
    const darkModeApplied = Hsl.getInversed(baseHsl, darkMode ? [] : ["lightness"]);
    const rgb = Hsl.toRgb(darkModeApplied);
    return Rgb.toRgbHexStr(rgb);
  };

  return () => ({
    set: state.set,
    get style() { return `
      :root {
        --color-base-light: ${getModeColor(state().base, false)};
        --color-base-dark: ${getModeColor(state().base, true)};
        --color-main-light: ${getModeColor(state().main, false)};
        --color-main-dark: ${getModeColor(state().main, true)};
        --color-accent-light: ${getModeColor(state().accent, false)};
        --color-accent-dark: ${getModeColor(state().accent, true)};
      }
    `;},
    get base() { return getModeColor(state().base, darkMode()); },
    get darkBase() { return getModeColor(state().base, true); },
    get lightBase() { return getModeColor(state().base, false); },
    get main() { return getModeColor(state().main, darkMode()); },
    get accent() { return getModeColor(state().accent, darkMode()); },
    get darkMode() { return darkMode(); },
    toggleDarkMode,
  });
};

export const useTheme = createRoot(createTheme);
