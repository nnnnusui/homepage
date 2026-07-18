import { createRoot, onCleanup, onMount } from "solid-js";

import { Wve } from "~/type/struct/Wve";

const createMidiAccess = () => {
  const store = Wve.create<{
    status: MidiAccessStatus;
    inputs: Record<string, MidiPortState>;
    outputs: Record<string, MidiPortState>;
  }>({
    status: "idle",
    inputs: {},
    outputs: {},
  });

  const syncPorts = (access: MIDIAccess) => {
    const inputs: Record<string, MidiPortState> = {};
    access.inputs.forEach((port) => { inputs[port.id] = toPortState(port); });
    const outputs: Record<string, MidiPortState> = {};
    access.outputs.forEach((port) => { outputs[port.id] = toPortState(port); });
    store.set((prev) => ({ ...prev, inputs, outputs }));
  };

  let midiAccess: MIDIAccess | undefined;
  onMount(async () => {
    if (!navigator.requestMIDIAccess) {
      store.set("status", "unsupported");
      return;
    }
    store.set("status", "requesting");
    try {
      midiAccess = await navigator.requestMIDIAccess();
      store.set("status", "ready");
      syncPorts(midiAccess);
      midiAccess.onstatechange = () => syncPorts(midiAccess!);
    } catch {
      store.set("status", "denied");
    }
  });
  onCleanup(() => {
    midiAccess?.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    if (midiAccess) {
      midiAccess.onstatechange = null;
    }
  });

  return () => Wve.assign(store.readonly(), {
    get raw() { return midiAccess; },
  });
};

export const useMidiAccess = createRoot(createMidiAccess);

export type MidiAccessStatus = "idle" | "requesting" | "ready" | "denied" | "unsupported";

export type MidiPortState = {
  id: string;
  name: string;
  manufacturer: string;
  type: MIDIPort["type"];
  state: MIDIPort["state"];
  connection: MIDIPort["connection"];
};

const toPortState = (port: MIDIPort): MidiPortState => ({
  id: port.id,
  name: port.name ?? "",
  manufacturer: port.manufacturer ?? "",
  type: port.type,
  state: port.state,
  connection: port.connection,
});
