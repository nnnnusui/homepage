import styles from "./index.module.styl";
import { PageTitle } from "../components/PageTitle";

import { PageInfo } from "@/components/_PageInfo";

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
