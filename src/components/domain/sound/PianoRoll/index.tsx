import { createEffect, For, onCleanup, Show } from "solid-js";

import { ButtonStyled } from "~/components/foundation/ui/ButtonStyled";
import { Grid, useGrid } from "~/components/foundation/ui/headless/Grid";
import { cn } from "~/fn/cn";
import { Calc } from "~/fn/objCalc";
import { Objects } from "~/fn/objects";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";

import styles from "./PianoRoll.module.css";

const NOTES_PER_OCTAVE = 12;
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const MIN_NOTE = 36; // C2
const GRID_NOTE_ROW_ZERO = 60; // C4
const MAX_NOTE = 84; // C7
const VISIBLE_NOTES = MAX_NOTE - MIN_NOTE + 1;
const PIXELS_PER_NOTE = 20;
const GRID_CELL_WIDTH = 50; // pixels per beat

export const PianoRoll = (p: {
  class?: string;
}) => {
  const grid = useGrid({
    origin: "center-left",
    virtualPadding: { top: 100, right: 1000, bottom: 0, left: 0 },
    initGridSize: { width: GRID_CELL_WIDTH, height: PIXELS_PER_NOTE },
  });
  const state = Wve.create({
    dragMode: "pan" as "pan" | "notePlacement",
    notes: [] as PianoRollPlacedNote[],
  });
  const notePlacement = createPianoRollNotePlacement({ grid });
  createSynth({
    get playing() { return true; },
    get activeNoteMap() {
      const draftingMidiNote = notePlacement.state().draftNote?.note;
      if (!draftingMidiNote) return {} as Record<NoteId, { frequency: number }>;
      const draftingNote = { frequency: midiToFreq(draftingMidiNote) };
      return { ["drafting"]: draftingNote };
    },
  });

  const getNoteLabel = (note: number): string => {
    const octave = Math.floor(note / NOTES_PER_OCTAVE);
    const noteName = NOTE_NAMES[note % NOTES_PER_OCTAVE];
    return `${noteName}${octave}`;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (state().dragMode === "pan") return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    notePlacement.onPointerDown(e);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    notePlacement.onPointerMove(e);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const placedNote = notePlacement.onPointerUp(e);
    if (!placedNote) return;
    state.set("notes", state().notes.length, placedNote);
  };

  const cursorPos = () => Calc.floor(grid.getCellPosFromViewportVirtualPos(grid.virtualPointerPos));

  return (
    <Grid class={p.class} api={grid}>
      <Grid.Header area="bottom-center">
        <ButtonStyled pressed={state().dragMode === "pan"} onApply={() => state.set("dragMode", "pan")}>
          Pan
        </ButtonStyled>
        <ButtonStyled pressed={state().dragMode === "notePlacement"} onApply={() => state.set("dragMode", "notePlacement")}>
          Note Placement
        </ButtonStyled>
      </Grid.Header>
      <Grid.Viewport>
        <Grid.Background
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
        <For each={state().notes}>{(note) => (
          <Grid.Content
            pos={{ x: note.startBeat, y: noteToRow(note.note) }}
            size={{ width: note.duration, height: 1 }}
            class="bg-amber-400 pointer-events-none"
          />
        )}</For>
        <Show when={notePlacement.state().draftNote}>{(draftNote) => (
          <Grid.Content
            pos={{ x: draftNote().startBeat, y: noteToRow(draftNote().note) }}
            size={{ width: draftNote().duration, height: 1 }}
            class="bg-amber-400 pointer-events-none opacity-25"
          />
        )}</Show>

        <Grid.Content
          pos={cursorPos()}
          size={{ width: 1, height: "full" }}
          class="bg-amber-200 pointer-events-none opacity-10"
        />
        <Grid.Content
          pos={cursorPos()}
          size={{ width: "full", height: 1 }}
          class="bg-amber-200 pointer-events-none opacity-10"
        />
        <Grid.Content
          pos={cursorPos()}
          size={{ width: 1, height: 1 }}
          class="bg-amber-200 pointer-events-none opacity-10"
        />
      </Grid.Viewport>
      <Grid.Header area="left">
        <For each={Array.from({ length: VISIBLE_NOTES }, (_, i) => MAX_NOTE - i)}>
          {(note) => (
            <Grid.Content
              pos={{ x: 0, y: noteToRow(note) }}
              size={{ width: 1, height: 1 }}
              class={cn(styles.Key, {
                [styles.IsBlackKey]: [1, 3, 6, 8, 10].includes(
                  note % 12,
                ),
              })}
            >
              <span class={styles.KeyLabel}>{getNoteLabel(note)}</span>
            </Grid.Content>
          )}
        </For>
      </Grid.Header>
      <Grid.Debug />
    </Grid>
  );
};

type PianoRollDraftNote = {
  note: number;
  startBeat: number;
  duration: number;
  anchorBeat: number;
  currentBeat: number;
};

type PianoRollPlacedNote = {
  note: number;
  startBeat: number;
  duration: number;
};

export const createPianoRollNotePlacement = (p: {
  grid: ReturnType<typeof useGrid>;
}) => {
  const state = Wve.create<{
    anchorCell: Pos | undefined;
    draftNote: PianoRollDraftNote | undefined;
  }>({
    anchorCell: undefined,
    draftNote: undefined,
  });

  const getCellFromEvent = (event: PointerEvent) => {
    const viewportRef = p.grid.state().viewportRef;
    if (!viewportRef) return;

    const viewportPhysicalPos = Pos.fromEvent(event, { relativeTo: viewportRef });
    const viewportVirtualPos = p.grid.getViewportVirtualPosFromViewportPhysicalPos(viewportPhysicalPos);
    const cellPos = Calc.floor(p.grid.getCellPosFromViewportVirtualPos(viewportVirtualPos));
    const note = rowToNote(cellPos.y);

    if (note < MIN_NOTE || note > MAX_NOTE) return;

    return {
      x: Math.max(cellPos.x, 0),
      y: cellPos.y,
    } satisfies Pos;
  };

  const createDraftNoteFromCells = (anchorCell: Pos, currentCell: Pos): PianoRollDraftNote => {
    const startBeat = Math.min(anchorCell.x, currentCell.x);
    const endBeat = Math.max(anchorCell.x, currentCell.x) + 1;

    return {
      note: rowToNote(anchorCell.y),
      startBeat,
      duration: Math.max(endBeat - startBeat, 1),
      anchorBeat: anchorCell.x,
      currentBeat: currentCell.x,
    };
  };

  const onPointerDown = (event: PointerEvent) => {
    const anchorCell = getCellFromEvent(event);
    if (!anchorCell) return;

    const draftNote = createDraftNoteFromCells(anchorCell, anchorCell);

    state.set({
      anchorCell,
      draftNote,
    });

    return draftNote;
  };

  const onPointerMove = (event: PointerEvent) => {
    const anchorCell = state().anchorCell;
    if (!anchorCell) return;

    const currentCell = getCellFromEvent(event);
    if (!currentCell) return state().draftNote;

    const draftNote = createDraftNoteFromCells(anchorCell, currentCell);
    state.set("draftNote", draftNote);

    return draftNote;
  };

  const onPointerUp = (event: PointerEvent): PianoRollPlacedNote | undefined => {
    const anchorCell = state().anchorCell;
    if (!anchorCell) return;

    const currentCell = getCellFromEvent(event) ?? anchorCell;
    const draftNote = createDraftNoteFromCells(anchorCell, currentCell);
    const placedNote: PianoRollPlacedNote = {
      note: draftNote.note,
      startBeat: draftNote.startBeat,
      duration: draftNote.duration,
    };

    state.set({
      anchorCell: undefined,
      draftNote: undefined,
    });

    return placedNote;
  };

  return {
    state,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};

const noteToRow = (note: number) => GRID_NOTE_ROW_ZERO - note;

const rowToNote = (row: number) => GRID_NOTE_ROW_ZERO - row;

type NoteId = string;
const createSynth = (p: {
  playing: boolean;
  activeNoteMap: Record<NoteId, { frequency: number }>;
}) => {
  const state = Wve.create({
    playingNotes: {} as Record<NoteId, { oscillatorNode: OscillatorNode; gainNode: GainNode }>,
  });
  let ctx: AudioContext | null = null;

  const getAudioContext = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  createEffect(() => {
    const audioContext = getAudioContext();

    const allNoteIds = new Set([...Object.keys(p.activeNoteMap), ...Object.keys(state().playingNotes)]);
    allNoteIds.forEach((noteId) => {
      const activeNote = p.activeNoteMap[noteId];
      const alreadyPlaying = state().playingNotes[noteId];
      if (activeNote && alreadyPlaying) return;
      if (!activeNote && alreadyPlaying) {
        const t = audioContext.currentTime;
        alreadyPlaying.gainNode.gain.cancelScheduledValues(t);
        alreadyPlaying.gainNode.gain.setValueAtTime(alreadyPlaying.gainNode.gain.value, t);
        alreadyPlaying.gainNode.gain.linearRampToValueAtTime(0, t + 0.05);
        alreadyPlaying.oscillatorNode.stop(t + 0.05);
        state.set("playingNotes", noteId, undefined!);
      }
      if (activeNote && !alreadyPlaying) {
        const oscillatorNode = audioContext.createOscillator();
        oscillatorNode.type = "sine";
        oscillatorNode.frequency.value = activeNote!.frequency;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.05;
        oscillatorNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillatorNode.start();
        state.set("playingNotes", noteId, { oscillatorNode, gainNode });
      }
    });
  });

  onCleanup(() => {
    const t = ctx?.currentTime ?? 0;
    Objects.values(state().playingNotes).forEach(({ oscillatorNode }) => {
      try { oscillatorNode.stop(t); } catch { /* already stopped */ }
    });
    void ctx?.close();
  });
};

const midiToFreq = (note: number) => 440 * 2 ** ((note - 69) / 12);
