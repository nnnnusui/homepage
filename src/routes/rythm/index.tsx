import clsx from "clsx";
import {
  JSX,
  createSignal,
} from "solid-js";

import styles from "./Rythm.module.styl";

import { ModeSelector } from "@/components/rythm/ModeSelector";

export const Rythm = (
): JSX.Element => {
  type Mode = "source" | "note"
  const [mode, setMode] = createSignal<Mode>("source");
  const [length] = createSignal(10);
  const [pixelPerSecond] = createSignal(400);
  const fullLength = () => length() * pixelPerSecond();

  type Keyframe = {
    kind: "source"
    time: number
    x: number
  }
  const [keyframes, setKeyframes] = createSignal<Keyframe[]>([]);
  const getPositionFromEvent
    = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };
  return (
    <section
      class={clsx(styles.Rythm)}
    >
      <div
        class={styles.Scroller}
      >
        <div
          class={styles.ScrollContent}
          style={{
            height: `${fullLength()}px`,
          }}
        />
      </div>
      <ModeSelector
        state={mode()}
        setState={setMode}
        suggestions={{
          source: <>YT</>,
          note: <>Note</>,
        }}
      />
    </section>
  );
};
export default Rythm;
