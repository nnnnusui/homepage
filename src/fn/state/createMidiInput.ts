import { createEffect, onCleanup } from "solid-js";

import { MidiAccessStatus, useMidiAccess } from "~/fn/state/root/useMidiAccess";
import { Wve } from "~/type/struct/Wve";

/** note number (0-127) -> velocity (0 = off) */
type ActiveNotes = Record<number, number>;

export const createMidiInput = () => {
  const midi = useMidiAccess();
  const midiAccess = useMidiAccess();
  const state = Wve.create({
    activeNotes: {} as ActiveNotes,
  });

  const handleMessage = (event: MIDIMessageEvent) => {
    const data = event.data;
    if (!data || data.length < 3) return;
    const statusByte = data[0];
    const note = data[1];
    const velocity = data[2];
    if (statusByte === undefined || note === undefined || velocity === undefined) return;
    const messageType = statusByte & 0xf0;
    if (messageType === 0x90 && velocity > 0) {
      state.set("activeNotes", note, velocity);
    } else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
      state.set("activeNotes", note, 0);
    }
  };

  createEffect(() => {
    void midi().inputs;
    if (midi().status !== "ready") return;
    const access = midiAccess.raw;
    if (!access) return;

    access.inputs.forEach((input) => {
      input.onmidimessage = handleMessage;
    });
  });

  onCleanup(() => {
    midiAccess.raw?.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
  });

  const noteOn = (note: number, velocity = 100) => state.set("activeNotes", note, velocity);
  const noteOff = (note: number) => state.set("activeNotes", note, 0);
  const status = (): MidiAccessStatus => midi().status;
  const activeNotes = state.partial("activeNotes");

  return {
    get status() { return status(); },
    get activeNotes() { return activeNotes(); },
    noteOn,
    noteOff,
  };
};
