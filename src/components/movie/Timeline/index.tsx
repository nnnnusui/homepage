import { createElementSize } from "@solid-primitives/resize-observer";
import clsx from "clsx";
import {
  For,
  JSX,
  createSignal,
} from "solid-js";

import { MiniMap } from "@/components/ui/MiniMap";
import { createCamera } from "@/fn/state/createCamera";
import { usePointers } from "@/fn/state/usePointers";
import { Position } from "@/type/struct/Position";
import { Size } from "@/type/struct/Size";

import styles from "./Timeline.module.styl";

export const Timeline = (p: {
  class?: string;
}): JSX.Element => {
  const camera = createCamera({
    bound: {
      position: {
        min: Position.init(),
        max: Position.from(5000),
      },
    },
  });
  const layers = () => (Array.from(Array(100).keys()));
  const { set: setPointers } = usePointers((pointers) => {
    const points = pointers.map((pointer) => ({
      x: pointer.currentOffsetX,
      y: pointer.currentOffsetY,
    }));
    camera.set.byPositions(points, true);
  });

  const [getCameraRef, setCameraRef] = createSignal<HTMLDivElement>();
  const cameraSizeRaw = createElementSize(getCameraRef);
  const cameraSize = () => Size.from({
    width: cameraSizeRaw.width ?? 0,
    height: cameraSizeRaw.height ?? 0,
  });

  return (
    <div
      class={clsx(styles.Timeline, p.class)}
      style={{
        "--camera-x": camera.get.translate.x,
        "--camera-y": camera.get.translate.y,
        "--camera-width": camera.get.scale.width,
        "--camera-height": camera.get.scale.height,
      }}
    >
      <div
        class={styles.Content}
        ref={setCameraRef}
        {...setPointers.getEventListeners()}
      >
        <section
          style={{
            position: "sticky",
            top: "0",
            left: "0",
          }}
        >
          <h1>[debug print]</h1>
          <p>camera: {JSON.stringify(camera.get.state)}</p>
          <p>progress: {JSON.stringify(camera.get.progress)}</p>
        </section>
        <div
          class={styles.Layers}
        >
          <For each={layers()}>{(layer) => (
            <div
              class={styles.Layer}
            >
              {layer}
            </div>
          )}</For>
        </div>
      </div>
      <MiniMap
        class={styles.VerticalScroller}
        direction="vertical"
        camera={camera}
        cameraSize={cameraSize()}
      />
      <MiniMap
        class={styles.HorizontalScroller}
        direction="horizontal"
        camera={camera}
        cameraSize={cameraSize()}
      />
      <MiniMap
        class={styles.MiniMap}
        direction="map"
        camera={camera}
        cameraSize={cameraSize()}
      />
    </div>
  );
};
