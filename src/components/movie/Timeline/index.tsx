import clsx from "clsx";
import {
  For,
  JSX,
} from "solid-js";

import { createCamera } from "@/fn/state/createCamera";
import { usePointers } from "@/fn/state/usePointers";
import { Position } from "@/type/struct/Position";

import styles from "./Timeline.module.styl";

export const Timeline = (p: {
  class?: string;
}): JSX.Element => {
  const { get: camera, set: setCamera } = createCamera({
    bound: {
      translate: {
        min: Position.init(),
        max: Position.from(1000),
      },
    },
  });
  const layers = () => (Array.from(Array(100).keys()));
  const { set: setVerticalPointers } = usePointers((pointers) => {
    const positions = pointers.map((it) => Position.from({
      x: it.currentOffsetX,
      y: it.currentOffsetY,
    }));
    setCamera.byPositions(positions);
  });
  const { set: setHorizontalPointers } = usePointers((pointers) => {
    const positions = pointers.map((it) => Position.from({
      x: it.currentOffsetX,
      y: it.currentOffsetY,
    }));
    setCamera.byPositions(positions);
  });

  return (
    <div
      class={clsx(styles.Timeline, p.class)}
      style={{
        "--camera-x": camera.translate.x,
        "--camera-y": camera.translate.y,
        "--camera-width": camera.scale.width,
        "--camera-height": camera.scale.height,
      }}
    >
      <div
        class={styles.Layers}
      >
        <p
          style={{
            position: "sticky",
            top: "0",
            left: "0",
          }}>
          {JSON.stringify(camera)}
        </p>
        <For each={layers()}>{(layer) => (
          <div
            class={styles.Layer}
          >
            {layer}
          </div>
        )}</For>
      </div>
      <div
        class={styles.VerticalScroller}
        {...setVerticalPointers.getEventListeners()}
      />
      <div
        class={styles.HorizontalScroller}
        {...setHorizontalPointers.getEventListeners()}
      />
      <div class={styles.MiniMap} />
    </div>
  );
};
