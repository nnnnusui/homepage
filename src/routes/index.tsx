import { createSignal, Show } from "solid-js";

import styles from "./index.module.styl";

import { PageInfo } from "@/components/_PageInfo";
import { PageTitle } from "@/components/PageTitle";
import { Clavier } from "@/components/sound/Clavier";

export default function Home() {
  const [started, setStarted] = createSignal(false);

  return (
    <main
      class={styles.Page}
      onClick={() => setStarted(true)}
    >
      <PageInfo
        title={(domain) => `home - ${domain}`}
        description={"In production..."}
      />
      <PageTitle>
        N4U
      </PageTitle>
      <Show when={started()} fallback={"plz click..."}>
        <div>
          <Clavier />
        </div>
      </Show>
    </main>
  );
}
