import { createRoot } from "solid-js";

import { Wve } from "~/type/struct/Wve";

const createInStorybook = () => {
  const state = Wve.create(false);
  return () => state;
};

export const useInStorybook = createRoot(createInStorybook);
