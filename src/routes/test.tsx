import { onMount } from "solid-js";

import { ButtonStyled } from "~/components/foundation/ui/ButtonStyled";
import { PageInfo } from "~/components/route/PageInfo";
import { createEnvelope, Envelope } from "~/domain/sound/vst/Envelope";
import { createWaveTable, WaveTable } from "~/domain/sound/vst/WaveTable";
import { useAudioEnvironment } from "~/fn/state/root/useAudioEnvironment";

export default function Test() {
  const audioEnv = useAudioEnvironment();
  const envelope = createEnvelope({});
  const waveTable = createWaveTable({});

  onMount(() => {
    audioEnv.useContext(async (context) => {
      (await waveTable.node.ready)
        .connect(await envelope.node.ready)
        .connect(context.destination);
    });
  });

  return (
    <main class="h-full flex flex-col items-center justify-start gap-8 p-4">
      <PageInfo
        title={(domain) => `test - ${domain}`}
        description="In production..."
      />
      <ButtonStyled
        onApply={() => {}}
        onPointerDown={() => envelope.node.noteOn()}
        onPointerUp={() => envelope.node.noteOff()}
      >Play</ButtonStyled>
      <WaveTable api={waveTable}>
        <WaveTable.View3D />
        <WaveTable.Editor />
      </WaveTable>
      <Envelope api={envelope}>
        <Envelope.View />
        <Envelope.Editor />
      </Envelope>
    </main>
  );
}
