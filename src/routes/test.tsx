import { PageInfo } from "~/components/route/PageInfo";
import { WaveTable } from "~/domain/sound/vst/WaveTable";

export default function Test() {

  return (
    <main class="h-full flex flex-col items-center justify-center gap-8 p-4">
      <PageInfo
        title={(domain) => `test - ${domain}`}
        description="In production..."
      />
      <WaveTable>
        <WaveTable.View3D />
        <WaveTable.Player />
        <WaveTable.Editor />
      </WaveTable>
    </main>
  );
}
