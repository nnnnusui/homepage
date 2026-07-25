import { onMount } from "solid-js";

import { Piano } from "~/components/domain/sound/Piano";
import { Resizable } from "~/components/foundation/render/Resizable";
import { ButtonStyled } from "~/components/foundation/ui/ButtonStyled";
import { PageInfo } from "~/components/route/PageInfo";
import { createEnvelope, Envelope } from "~/domain/sound/vst/Envelope";
import { createWaveTable, WaveTable } from "~/domain/sound/vst/WaveTable";
import { createMidiInput } from "~/fn/state/createMidiInput";
import { useAudioEnvironment } from "~/fn/state/root/useAudioEnvironment";

export default function Test() {
  const audioEnv = useAudioEnvironment();
  const envelope = createEnvelope({});
  const waveTable = createWaveTable({});

  const { activeNotes, noteOn, noteOff } = createMidiInput();

  onMount(() => {
    audioEnv.useContext(async ({ connectFrom }) => {
      connectFrom(
        (await waveTable.node.ready)
          .connect(await envelope.node.ready),
      );
    });
  });

  return (
    <main class="min-h-full flex flex-col items-center justify-center gap-8 p-4">
      <PageInfo
        title={(domain) => `test - ${domain}`}
        description="In production..."
      />
      <Piano activeNotes={activeNotes}
        onNoteOn={(note) => {
          const frequency = midiToFreq(note);
          waveTable.state.set("frequency", frequency);
          envelope.node.noteOn();
          noteOn(note);
        }}
        onNoteOff={(note) => {
          const frequency = midiToFreq(note);
          waveTable.state.set("frequency", frequency);
          envelope.node.noteOff();
          noteOff(note);
        }}
      />
      <ButtonStyled
        onApply={() => {}}
        onPointerDown={() => envelope.node.noteOn()}
        onPointerUp={() => envelope.node.noteOff()}
      >Play</ButtonStyled>
      <WaveTable api={waveTable}>
        <Resizable resizable={["bottom"]}
          class="size-full"
        >
          <WaveTable.View3D />
        </Resizable>
        <WaveTable.Editor />
      </WaveTable>
      <Envelope api={envelope}
        class="relative overflow-hidden w-full p-2 border rounded-lg border-slate-700/70 flex flex-col gap-4"
      >
        <Envelope.View>
          <Envelope.Scaler class="absolute top-0 right-0" />
          <Envelope.Anchor.All />
        </Envelope.View>
        <Envelope.Knob.All />
      </Envelope>
    </main>
  );
}

const midiToFreq = (note: number) => 440 * 2 ** ((note - 69) / 12);
