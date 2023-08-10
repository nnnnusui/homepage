import styles from "./index.module.styl";

import { PageInfo } from "@/components/_PageInfo";
import { PageTitle } from "@/components/PageTitle";

export default function Home() {
  return (
    <main class={styles.Page}>
      <PageInfo
        title={(domain) => `home - ${domain}`}
        description={"In production..."}
      />
      <PageTitle>
        N4U
      </PageTitle>
    </main>
  );
}
