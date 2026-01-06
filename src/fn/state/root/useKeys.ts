import { JSX, createRoot } from "solid-js";
import { createStore } from "solid-js/store";

const createKeys = () => {
  const [store, setStore] = createStore<Keys>({ onPresses: {} });

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>
    = (event) => setStore("onPresses", event.key, true);
  const onKeyUp: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>
    = (event) => setStore("onPresses", event.key, false);

  return () => [
    store,
    {
      set: setStore,
    },
    {
      onKeyDown,
      onKeyUp,
    },
  ] as const;
};

export const useKeys = createRoot(createKeys);

type Keys = {
  onPresses: Record<string, boolean>;
};
