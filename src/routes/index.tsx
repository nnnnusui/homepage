import { Show } from "solid-js";

import { Keyboard } from "~/components/domain/input/Keyboard";
import { KeyboardVisibilityToggleButton } from "~/components/domain/input/KeyboardVisibilityToggleButton";
import { PageTitle } from "~/components/PageTitle";
import { PageInfo } from "~/components/route/PageInfo";
import { ToggleDarkMode } from "~/components/ToggleDarkMode";
import { Wve } from "~/type/struct/Wve";

export default function Home() {
  const state = Wve.create({ showKeyboard: false });

  return (
    <main class="h-full flex flex-col items-center justify-center">
      <PageInfo
        title={(domain) => `home - ${domain}`}
        description="In production..."
      />
      <PageTitle>N4U</PageTitle>
      <div class="absolute inset-0 p-32 flex flex-rowjustify-center items-end">
        <div class="w-full flex flex-col gap-4 items-center">
          <Show when={state().showKeyboard}>
            <Keyboard />
          </Show>
          <div class="flex flex-row gap-4 items-center">
            <KeyboardVisibilityToggleButton visible={state.partial("showKeyboard")} />
            <ToggleDarkMode />
          </div>
        </div>
      </div>
    </main>
  );
}
