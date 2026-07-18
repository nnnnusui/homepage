import { createMemo, For } from "solid-js";

import { useTheme } from "~/fn/state/root/useTheme";

type KeyInfo = {
  note: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isBlack: boolean;
};

export const Piano = (p: {
  activeNotes: Record<number, number>;
  startOctave?: number;
  endOctave?: number;
  onNoteOn?: (note: number) => void;
  onNoteOff?: (note: number) => void;
}) => {
  const theme = useTheme();

  const octaveKeyboardRatio = [7,6,7,6,7,7,6,6,6,6,6,7];
  const blackKeyIndices = [1,3,6,8,10];
  const blackKeyWidthPx = 6;
  const whiteKeyWidthPx = 11;
  const blackKeyAfterMarginPx = whiteKeyWidthPx * 2;
  const keyboardHeightPx = whiteKeyWidthPx * 5;

  const startOctave = () => p.startOctave ?? 3;
  const octaveCount = () => ((p.endOctave ?? (startOctave() + 2)) - startOctave() + 1);
  const totalWidthPx = () => whiteKeyWidthPx * 7 * octaveCount();
  const keys = createMemo<KeyInfo[]>(() => {
    const result: KeyInfo[] = [];
    const n = octaveCount();

    // White keys
    for (let wi = 0; wi < 7 * n; wi++) {
      const oct = Math.floor(wi / 7);
      const semitone = [0, 2, 4, 5, 7, 9, 11][wi % 7]!;
      result.push({
        note: (startOctave() + oct + 1) * 12 + semitone,
        x: wi * whiteKeyWidthPx,
        y: 0,
        w: whiteKeyWidthPx,
        h: keyboardHeightPx,
        isBlack: false,
      });
    }

    // Black keys (prefix-sum the ratio array to find x positions)
    for (let oct = 0; oct < n; oct++) {
      let xOffset = oct * whiteKeyWidthPx * 7;
      for (let s = 0; s < 12; s++) {
        if (blackKeyIndices.includes(s)) {
          result.push({
            note: (startOctave() + oct + 1) * 12 + s,
            x: xOffset,
            y: 0,
            w: blackKeyWidthPx,
            h: keyboardHeightPx - blackKeyAfterMarginPx,
            isBlack: true,
          });
        }
        xOffset += octaveKeyboardRatio[s]!;
      }
    }

    return result;
  });

  const whiteKeys = () => keys().filter((k) => !k.isBlack);
  const blackKeys = () => keys().filter((k) => k.isBlack);

  const isActive = (note: number) => (p.activeNotes[note] ?? 0) > 0;

  let svgRef!: SVGSVGElement;
  const pointerNotes = new Map<number, number>();

  const clientToViewBox = (clientX: number, clientY: number) => {
    const ctm = svgRef.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const noteAt = (x: number, y: number): number | null => {
    // Black keys take priority (rendered on top)
    for (const k of blackKeys()) {
      if (x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h) return k.note;
    }
    for (const k of whiteKeys()) {
      if (x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h) return k.note;
    }
    return null;
  };

  const handlePointerDown = (e: PointerEvent) => {
    svgRef.setPointerCapture(e.pointerId);
    const { x, y } = clientToViewBox(e.clientX, e.clientY);
    const note = noteAt(x, y);
    if (note !== null) {
      pointerNotes.set(e.pointerId, note);
      p.onNoteOn?.(note);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!svgRef.hasPointerCapture(e.pointerId)) return;
    const { x, y } = clientToViewBox(e.clientX, e.clientY);
    const newNote = noteAt(x, y);
    const oldNote = pointerNotes.get(e.pointerId);
    if (newNote !== oldNote) {
      if (oldNote !== undefined) p.onNoteOff?.(oldNote);
      if (newNote !== null) {
        pointerNotes.set(e.pointerId, newNote);
        p.onNoteOn?.(newNote);
      } else {
        pointerNotes.delete(e.pointerId);
      }
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    svgRef.releasePointerCapture(e.pointerId);
    if (e.ctrlKey) return;
    const note = pointerNotes.get(e.pointerId);
    if (note !== undefined) {
      p.onNoteOff?.(note);
      pointerNotes.delete(e.pointerId);
    }
  };

  return (
    <svg ref={svgRef}
      class="select-none w-full h-auto"
      viewBox={`0 0 ${totalWidthPx()} ${keyboardHeightPx}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <For each={whiteKeys()}>{(whiteKey) => (
        <rect
          x={whiteKey.x}
          y={whiteKey.y}
          width={whiteKey.w}
          height={whiteKey.h}
          fill={isActive(whiteKey.note) ? theme.accent : "white"}
          stroke="#555"
          stroke-width={1}
        />
      )}</For>
      <For each={blackKeys()}>{(blackKey) => (
        <rect
          x={blackKey.x}
          y={blackKey.y}
          width={blackKey.w}
          height={blackKey.h}
          fill={isActive(blackKey.note) ? theme.accent : "#1a1a1a"}
        />
      )}</For>
    </svg>
  );
};
