import clsx from "clsx";
import {
  JSX, For,
} from "solid-js";

import { useCamera } from "@/fn/state/createCamera";

import styles from "./Timeline.module.styl";

export const Timeline = (p: {
  class?: string;
}): JSX.Element => {
  const { get: camera, set: setCamera } = useCamera();
  const layers = () => (Array.from(Array(100).keys()));

  return (
    <div
      class={clsx(styles.Timeline, p.class)}
      {...setCamera.getEventListeners({
        scaleRatioOnWheel: {
          width: 1.1,
          height: 1,
        },
      })}
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
        {JSON.stringify(camera.state)}
        <For each={layers()}>{(layer) => (
          <div
            class={styles.Layer}
          >
            {layer}
          </div>
        )}</For>
      </div>
      <div class={styles.VerticalScroller} />
      <div class={styles.HorizontalScroller} />
      <div class={styles.MiniMap} />
    </div>
  );
};
