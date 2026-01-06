import { PageTitle } from "~/components/PageTitle";
import { PageInfo } from "~/components/route/PageInfo";

export default function Home() {
  return (
    <main class="h-full flex flex-col items-center justify-center">
      <PageInfo
        title={(domain) => `home - ${domain}`}
        description="In production..."
      />
      <PageTitle>N4U</PageTitle>
      {/* <Show when={started()} fallback={"plz click..."}>
        <div>
          <Clavier />
        </div>
      </Show> */}
    </main>
  );
}
