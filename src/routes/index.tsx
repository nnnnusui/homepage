import { PageTitle } from "~/components/PageTitle";
import { PageInfo } from "~/components/route/PageInfo";
import { ToggleDarkMode } from "~/components/ToggleDarkMode";

export default function Home() {
  return (
    <main class="h-full flex flex-col items-center justify-center">
      <PageInfo
        title={(domain) => `home - ${domain}`}
        description="In production..."
      />
      <PageTitle>N4U</PageTitle>
      <div class="absolute inset-0 p-32 flex justify-center items-end">
        <ToggleDarkMode />
      </div>
    </main>
  );
}
