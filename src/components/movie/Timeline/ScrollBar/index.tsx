import clsx from "clsx";
import {
  JSX,
} from "solid-js";

import { Calc } from "@/fn/calc";
import { createCamera } from "@/fn/state/createCamera";
import { Size } from "@/type/struct/Size";

import styles from "./ScrollBar.module.styl";

export const ScrollBar = (p: {
  class: string;
  direction: "vertical" | "horizontal";
  camera: ReturnType<typeof createCamera>;
  cameraSize: Size;
}): JSX.Element => {
  const camera = () => p.camera.get;
  const cameraRatio = () => Calc["/"](p.cameraSize, Size.fromPosition(camera().range));

  return (
    <div
      class={clsx(
        styles.ScrollBar,
        p.direction === "vertical" && styles.Vertical,
        p.direction === "horizontal" && styles.Horizontal,
        p.class,
      )}
      style={{
        "--camera-ratio-x": cameraRatio().width,
        "--camera-ratio-y": cameraRatio().height,
        "--camera-progress-x": camera().progress.x,
        "--camera-progress-y": camera().progress.y,
      }}
    >
      <div
        class={styles.ThumbContainer}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
      >
        <div class={styles.Thumb} />
      </div>
      <div class={styles.ThumbMargin} />
    </div>
  );
};
