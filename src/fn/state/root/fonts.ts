import { createRoot } from "solid-js";
import { createStore } from "solid-js/store";

export type Font = {
  family: string
  url: string
}
const createFonts = () => {
  const [fonts, setFonts] = createStore<Font[]>([]);
  const add = (font: Font) => setFonts((prev) => [...prev, font]);

  return [
    fonts,
    {
      set: setFonts,
      add,
    },
  ] as const;
};
export const useFonts = createRoot(createFonts);
