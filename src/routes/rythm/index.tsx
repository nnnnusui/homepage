import clsx from "clsx";
import {
  For,
  JSX, createSignal,
} from "solid-js";

import styles from "./Rythm.module.styl";

export const Rythm = (
): JSX.Element => {
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
      <header>
        top outside
      </header>
      <div
        class={styles.Scroller}
      >
        <div
          class={styles.ScrollContent}
          style={{
            height: `${fullLength()}px`,
          }}
          onPointerUp={(event) => {
            const pos = getPositionFromEvent(event);
            const time = pos.y / pixelPerSecond();
            setKeyframes((prev) => ([
              ...prev,
              {
                kind: "source",
                time,
                x: pos.x,
              },
            ]));
          }}
          onDragEnter={(event) => {
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer) return;
            event.preventDefault();
            console.log("drag enter.");
            dataTransfer.dropEffect = "copy";
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer) return;
            event.preventDefault();
            console.log("drop.");
            const data = dataTransfer.getData("text/plain");
            console.log(data);
          }}
        >
          <For each={keyframes()}>{(keyframe) =>
            <div
              class={styles.Keyframe}
              style={{
                top: `${keyframe.time * pixelPerSecond()}px`,
                left: `${keyframe.x}px`,
              }}
            />
          }</For>
        </div>
      </div>
      <footer>
        bottom outside
        <div
          draggable={true}
          onDragStart={(event) => {
            console.log("drag started.");
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer) return;
            dataTransfer.effectAllowed = "copy";
            dataTransfer.setData("text/plain", "source");
          }}
        >
          Src
        </div>
      </footer>
    </section>
  );
};
export default Rythm;
