import { createElementSize } from "@solid-primitives/resize-observer";
import clsx from "clsx";
import {
  JSX, createSignal,
} from "solid-js";

import { Calc } from "@/fn/calc";
import { createCamera } from "@/fn/state/createCamera";
import { HtmlEvent } from "@/type/HtmlEvent";
import { Position } from "@/type/struct/Position";
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
  const [getThumbRef, setThumbRef] = createSignal<HTMLDivElement>();
  const thumbSizeRaw = createElementSize(getThumbRef);
  const thumbSize = () => Size.from({
    width: thumbSizeRaw.width ?? 0,
    height: thumbSizeRaw.height ?? 0,
  });

  const [getInAction, setInAction] = createSignal<{
    offsetInThumb: Position;
  }>();
  const setCameraByRatio = (ratio: Size) => {
    if (p.direction === "horizontal") {
      p.camera.set.state("translate", "x", p.camera.get.range.x * (-1 * ratio.width));
    } else {
      p.camera.set.state("translate", "y", p.camera.get.range.y * (-1 * ratio.height));
    }
  };

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
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        if (getInAction()) return;
        const offsetInThumb = Calc["/"](Size.toPosition(thumbSize()), 2);
        const ratio = getScrollRatio(event, thumbSize(), offsetInThumb);
        setInAction({ offsetInThumb });
        setCameraByRatio(ratio);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const inAction = getInAction();
        if (!inAction) return;
        const ratio = getScrollRatio(event, thumbSize(), inAction.offsetInThumb);
        setCameraByRatio(ratio);
      }}
      onPointerUp={() => {
        setInAction();
      }}
    >
      <div
        class={styles.ThumbContainer}
      >
        <div
          class={styles.Thumb}
          ref={setThumbRef}
          onPointerDown={(event) => {
            const targetRect = event.currentTarget.getBoundingClientRect();
            const offset = {
              x: event.clientX - targetRect.left,
              y: event.clientY - targetRect.top,
            };
            setInAction({
              offsetInThumb: offset,
            });
          }}
        />
      </div>
      <div
        class={styles.ThumbMargin}
      />
    </div>
  );
};

const getScrollRatio = (
  event: HtmlEvent<PointerEvent>,
  thumbSize: Size,
  thumbOffset: Position,
) => {
  const targetRect = event.currentTarget.getBoundingClientRect();
  const targetSize = Size.from(targetRect);
  const clicked = {
    x: event.clientX,
    y: event.clientY,
  };
  const shifted = Calc["-"](clicked, thumbOffset);
  const offset = {
    x: shifted.x - targetRect.left,
    y: shifted.y - targetRect.top,
  };
  const scrollRange = Calc["-"](targetSize, thumbSize);
  const ratio = Calc["/"](Size.fromPosition(offset), scrollRange);
  return ratio;
};
