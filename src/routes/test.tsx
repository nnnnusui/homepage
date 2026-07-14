import { PageInfo } from "~/components/route/PageInfo";
import { Oscillator } from "~/domain/sound/vst/Oscillator";

export default function Test() {

  return (
    <main class="h-full flex flex-col items-center justify-center gap-8 p-4">
      <PageInfo
        title={(domain) => `test - ${domain}`}
        description="In production..."
      />
      <Oscillator />
    </main>
  );
}
