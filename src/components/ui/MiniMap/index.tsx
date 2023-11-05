import { createElementSize } from "@solid-primitives/resize-observer";
import clsx from "clsx";
import {
  JSX,
  createSignal,
} from "solid-js";

import { Calc } from "@/fn/calc";
import { createCamera } from "@/fn/state/createCamera";
import { HtmlEvent } from "@/type/HtmlEvent";
import { Position } from "@/type/struct/Position";
import { Size } from "@/type/struct/Size";

import styles from "./MiniMap.module.styl";

export const MiniMap = (p: {
  class: string;
  direction: "vertical" | "horizontal" | "map";
  camera: ReturnType<typeof createCamera>;
  cameraSize: Size;
}): JSX.Element => {
  const cameraRatio = () => Calc["/"](p.cameraSize, Size.fromPosition(p.camera.get.range));
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
    const next = Calc["*"](p.camera.get.range, Position.fromSize(Calc.opposite(ratio)));
    switch (p.direction) {
      case "vertical":
        p.camera.set.translate({ y: next.y });
        break;
      case "horizontal":
        p.camera.set.translate({ x: next.x });
        break;
      case "map":
        p.camera.set.translate(next);
        break;
    }
  };

  return (
    <div
      class={clsx(
        styles.MiniMap,
        p.direction === "vertical" && styles.Vertical,
        p.direction === "horizontal" && styles.Horizontal,
        p.direction === "map" && styles.Map,
        p.class,
      )}
      style={{
        "--camera-ratio-x": cameraRatio().width,
        "--camera-ratio-y": cameraRatio().height,
        "--camera-progress-x": p.camera.get.progress.x,
        "--camera-progress-y": p.camera.get.progress.y,
        "--thumb-size-height": thumbSize().height,
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        if (getInAction()) return;
        const offsetInThumb = Calc["/"](Position.fromSize(thumbSize()), 2);
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
