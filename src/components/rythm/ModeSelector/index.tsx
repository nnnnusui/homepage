import clsx from "clsx";
import {
  JSX, For,
} from "solid-js";

import styles from "./ModeSelector.module.styl";

import { getObjectEntries } from "@/fn/getObjectEntries";

export const ModeSelector = <
  State extends string,
>(p: {
  state: State
  suggestions: Record<State, JSX.Element>
  setState: (state: State) => void
  children?: JSX.Element
}): JSX.Element => {

  return (
    <fieldset
      class={clsx(
        styles.ModeSelector,
      )}
    >
      <For each={getObjectEntries(p.suggestions)}>{([mode, label]) => {
        const selected = () => p.state === mode;

        return (
          <div
            class={clsx(
              styles.ModeSelectOption,
              selected() && styles.Selected
            )}
          >
            <label
              tabIndex={0}
            >
              <input
                class={clsx(
                  styles.RadioInput,
                )}
                type="radio"
                name="modeSelector"
                checked={selected()}
                onChange={(event) => {
                  if (!event.currentTarget.checked) return;
                  p.setState(mode);
                }}
                onClick={() => {
                  if (!selected()) return;
                  console.log(`Show ${mode} configure.`);
                }}
              />
              {label}
            </label>
            {p.children}
          </div>
        );
      }}</For>
    </fieldset>
  );
};
