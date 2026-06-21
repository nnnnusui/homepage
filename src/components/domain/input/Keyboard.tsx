import { For, onCleanup, onMount } from "solid-js";

import { Button } from "~/components/foundation/ui/headless/Button";
import { cn } from "~/fn/cn";
import { Objects } from "~/fn/objects";
import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { Wve } from "~/type/struct/Wve";
import { KeyboardKey } from "./KeyboardKey";

import styles from "./Keyboard.module.css";

type KeyUnitDefine = {
  label: string;
  code: string;
  widthPx?: number;
  heightPx?: number;
};

const keyboardRowsDefine: KeyUnitDefine[][] = [
  [
    { label: "Esc", code: "Escape", widthPx: 16 },
    { label: "1", code: "Digit1", widthPx: 12 },
    { label: "2", code: "Digit2", widthPx: 12 },
    { label: "3", code: "Digit3", widthPx: 12 },
    { label: "4", code: "Digit4", widthPx: 12 },
    { label: "5", code: "Digit5", widthPx: 12 },
    { label: "6", code: "Digit6", widthPx: 12 },
    { label: "7", code: "Digit7", widthPx: 12 },
    { label: "8", code: "Digit8", widthPx: 12 },
    { label: "9", code: "Digit9", widthPx: 12 },
    { label: "0", code: "Digit0", widthPx: 12 },
    { label: "-", code: "Minus", widthPx: 12 },
    { label: "=", code: "Equal", widthPx: 12 },
    { label: "Backspace", code: "Backspace", widthPx: 24 },
  ],
  [
    { label: "Tab", code: "Tab", widthPx: 20 },
    { label: "Q", code: "KeyQ", widthPx: 12 },
    { label: "W", code: "KeyW", widthPx: 12 },
    { label: "E", code: "KeyE", widthPx: 12 },
    { label: "R", code: "KeyR", widthPx: 12 },
    { label: "T", code: "KeyT", widthPx: 12 },
    { label: "Y", code: "KeyY", widthPx: 12 },
    { label: "U", code: "KeyU", widthPx: 12 },
    { label: "I", code: "KeyI", widthPx: 12 },
    { label: "O", code: "KeyO", widthPx: 12 },
    { label: "P", code: "KeyP", widthPx: 12 },
    { label: "[", code: "BracketLeft", widthPx: 12 },
    { label: "]", code: "BracketRight", widthPx: 12 },
    { label: "\\", code: "Backslash", widthPx: 20 },
  ],
  [
    { label: "Caps", code: "CapsLock", widthPx: 24 },
    { label: "A", code: "KeyA", widthPx: 12 },
    { label: "S", code: "KeyS", widthPx: 12 },
    { label: "D", code: "KeyD", widthPx: 12 },
    { label: "F", code: "KeyF", widthPx: 12 },
    { label: "G", code: "KeyG", widthPx: 12 },
    { label: "H", code: "KeyH", widthPx: 12 },
    { label: "J", code: "KeyJ", widthPx: 12 },
    { label: "K", code: "KeyK", widthPx: 12 },
    { label: "L", code: "KeyL", widthPx: 12 },
    { label: ";", code: "Semicolon", widthPx: 12 },
    { label: "'", code: "Quote", widthPx: 12 },
    { label: "Enter", code: "Enter", widthPx: 30 },
  ],
  [
    { label: "Shift", code: "ShiftLeft", widthPx: 30 },
    { label: "Z", code: "KeyZ", widthPx: 12 },
    { label: "X", code: "KeyX", widthPx: 12 },
    { label: "C", code: "KeyC", widthPx: 12 },
    { label: "V", code: "KeyV", widthPx: 12 },
    { label: "B", code: "KeyB", widthPx: 12 },
    { label: "N", code: "KeyN", widthPx: 12 },
    { label: "M", code: "KeyM", widthPx: 12 },
    { label: ",", code: "Comma", widthPx: 12 },
    { label: ".", code: "Period", widthPx: 12 },
    { label: "/", code: "Slash", widthPx: 12 },
    { label: "Shift", code: "ShiftRight", widthPx: 38 },
  ],
  [
    { label: "Ctrl", code: "ControlLeft", widthPx: 16 },
    { label: "Meta", code: "MetaLeft", widthPx: 16 },
    { label: "Alt", code: "AltLeft", widthPx: 16 },
    { label: "Space", code: "Space", widthPx: 84 },
    { label: "Alt", code: "AltRight", widthPx: 16 },
    { label: "Meta", code: "MetaRight", widthPx: 16 },
    { label: "Fn", code: "Fn", widthPx: 16 },
    { label: "Ctrl", code: "ControlRight", widthPx: 16 },
  ],
];

type KeyUnit = Required<KeyUnitDefine> & { x: number; y: number };
const gapPx = 2;
const defaultKeySizePx = { width: 12, height: 12 };
const keyboardRowsBase = keyboardRowsDefine
  .reduce((rowSum, row) => {
    const resultRow = row
      .reduce((prev, key) => {
        const currentKeyInfo = {
          ...key,
          widthPx: key.widthPx ?? defaultKeySizePx.width,
          heightPx: key.heightPx ?? defaultKeySizePx.height,
          x: prev.widthSum,
          y: rowSum.heightSum,
        };
        return {
          result: [...prev.result, currentKeyInfo],
          widthSum: prev.widthSum + (currentKeyInfo.widthPx + gapPx),
        };
      }, { result: [], widthSum: 0 } as { result: KeyUnit[]; widthSum: number });
    return {
      result: [...rowSum.result, resultRow.result],
      heightSum: rowSum.heightSum + defaultKeySizePx.height + gapPx, // Assuming each row has a height of 12px
    };
  }, { result: [] as KeyUnit[][], heightSum: 0 } satisfies { result: KeyUnit[][]; heightSum: number })
  .result;

export const Keyboard = () => {
  const pressed = Wve.create<Record<string, boolean>>({});
  const lastPressed = Wve.create<string | undefined>(undefined);

  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {pressed.set(e.code, true);};
    const onKeyUp = (e: KeyboardEvent) => pressed.set(e.code, undefined!);
    const onBlur = () => pressed.set((prev) => Objects.map(prev, () => undefined!));
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    });
  });

  const scale = () => 4;
  const keyboardRows = () => keyboardRowsBase
    .map((row) => row.map((key) => ({
      ...key,
      widthPx: key.widthPx * scale(),
      heightPx: key.heightPx * scale(),
      x: key.x * scale(),
      y: key.y * scale(),
    })));
  const keyboardSize = () => Size.from({
    width: Math.max(...keyboardRows().map((row) => Math.max(...row.map((key) => key.x + key.widthPx)))),
    height: Math.max(...keyboardRows().map((row) => Math.max(...row.map((key) => key.y + key.heightPx)))),
  });
  const onPointerMove = (e: PointerEvent) => {
    const pos = Pos.fromEvent(e);
    const key = keyboardRows().flatMap((row) => row)
      .find((key) => {
        return (
          pos.x >= key.x
        && pos.x <= key.x + key.widthPx
        && pos.y >= key.y
        && pos.y <= key.y + key.heightPx
        );
      });
    // console.log(key?.code);
  };

  return (
    <div class={cn(styles.Keyboard, "w-min-full inline-flex rounded-2xl border p-4 shadow-lg")}>
      <div class={cn("relative flex flex-col gap-2")}
        style={{
          width: `${keyboardSize().width}px`,
          height: `${keyboardSize().height}px`,
        }}
        onPointerMove={onPointerMove}
      >
        {/* <div class="absolute inset-0 pointer-events-none">
          <For each={keyboardRows().flatMap((row) => row)}>{(key) => (
            <div class="absolute border-2 border-dotted"
              style={{
                width: `${key.widthPx}px`,
                height: `${key.heightPx}px`,
                top: `${key.y}px`,
                left: `${key.x}px`,
              }}
            />
          )}</For>
        </div> */}
        <For each={keyboardRows()}>
          {(row) => (
            <div class="flex gap-2">
              <For each={row}>
                {(key) => (
                  <Button
                    style={{
                      width: `${key.widthPx}px`,
                      height: `${key.heightPx}px`,
                    }}
                    aria-label={key.label}
                    onApply={() => {}}
                  >
                    <KeyboardKey
                      label={key.label}
                      pressed={pressed()[key.code] || false}
                    />
                  </Button>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
