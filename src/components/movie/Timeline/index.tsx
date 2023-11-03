import { createElementSize } from "@solid-primitives/resize-observer";
import clsx from "clsx";
import {
  For,
  JSX,
  createSignal,
} from "solid-js";

import { Calc } from "@/fn/calc";
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

  const [getCameraRef, setCameraRef] = createSignal<HTMLDivElement>();
  const cameraSizeRaw = createElementSize(getCameraRef);
  const cameraSize = () => Position.from({
    x: cameraSizeRaw.width ?? 0,
    y: cameraSizeRaw.height ?? 0,
  });
  const cameraRatio = () => Calc["/"](cameraSize(), camera.range);

  return (
    <div
      class={clsx(styles.Timeline, p.class)}
      style={{
        "--camera-x": camera.translate.x,
        "--camera-y": camera.translate.y,
        "--camera-width": camera.scale.width,
        "--camera-height": camera.scale.height,
        "--camera-ratio-x": cameraRatio().x,
        "--camera-ratio-y": cameraRatio().y,
        "--camera-progress-y": camera.progress.y,
      }}
    >
      <div
        class={styles.Content}
        ref={setCameraRef}
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
            {JSON.stringify(camera.state)}
            {JSON.stringify(camera.progress)}
          </p>
          <For each={layers()}>{(layer) => (
            <div
              class={styles.Layer}
            >
              {layer}
            </div>
          )}</For>
        </div>
      </div>
      <div
        class={styles.VerticalScroller}
        {...setVerticalPointers.getEventListeners()}
      >
        <div class={styles.ThumbContainer}>
          <div class={styles.BeforeThumb} />
          <div
            class={styles.Thumb}
          >
            {JSON.stringify(cameraRatio(), null, 2)}
          </div>
        </div>
        <div class={styles.ThumbMargin} />
      </div>
      <div
        class={styles.HorizontalScroller}
        {...setHorizontalPointers.getEventListeners()}
      />
      <div class={styles.MiniMap} />
    </div>
  );
};
