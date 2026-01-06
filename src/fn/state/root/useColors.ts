import { createRoot } from "solid-js";
import { createStore } from "solid-js/store";

const createColors = () => {
  const [store, setStore] = createStore({
    base: "#181818",
    main: "#b1b1b1",
    accent: "#cc3232",
  });

  return () => [
    store,
    {
      set: setStore,
    },
  ] as const;
};

export const useColors = createRoot(createColors);
