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
  const cameraSize = () => Calc["/"](p.cameraSize, p.camera.get.scale);
  const cameraRatio = () => Calc["/"](cameraSize(), Size.fromPosition(p.camera.get.range));
  const [getMapRef, setMapRef] = createSignal<HTMLDivElement>();
  const mapSizeRaw = createElementSize(getMapRef);
  const mapSize = () => Size.from({
    width: mapSizeRaw.width ?? 1,
    height: mapSizeRaw.height ?? 1,
  });
  const [getThumbRef, setThumbRef] = createSignal<HTMLDivElement>();
  const thumbSizeRaw = createElementSize(getThumbRef);
  const thumbSize = () => Size.from({
    width: thumbSizeRaw.width ?? 1,
    height: thumbSizeRaw.height ?? 1,
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
      ref={setMapRef}
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
        class={styles.ScrollerThumb}
        ref={setThumbRef}
        onPointerDown={(event) => {
          const offset = getTargetOffset(event);
          setInAction({
            offsetInThumb: offset,
          });
        }}
      >
        <ScalerThumb
          setDataOnStart={(event) => {
            const pixelProgress = Calc["*"](p.camera.get.progress, Position.fromSize(mapSize()));
            const scrollerOffset = getTargetOffset(event, getThumbRef());
            const downPos = Calc["-"](scrollerOffset, pixelProgress);
            return ({
              downPos,
              pixelProgress,
              scrollerOffset,
              thumbSize: thumbSize(),
              mapSize: mapSize(),
              scale: { ...p.camera.get.scale },
              progress: { ...p.camera.get.progress },
            });
          }}
          useScalar={(scalar, onStart) => {
            const remain = Calc["-"](Position.from(1), onStart.progress);
            const base = Calc["+"](remain, Position.fromSize(onStart.thumbSize));
            const ratioScalar = Calc["/"](scalar, base);
            const scaleScalar = Calc["/"](Size.from(1), Size.fromPosition(Calc["+"](ratioScalar, 1)));
            const nextScale = Calc["*"](onStart.scale, scaleScalar);
            switch (p.direction) {
              case "vertical":
                if (!isFinite(nextScale.height)) return;
                p.camera.set.scale({ height: nextScale.height });
                break;
              case "horizontal":
                p.camera.set.scale({ width: nextScale.width });
                break;
              case "map":
                p.camera.set.scale(nextScale);
                break;
            }
          }}
        />
      </div>
    </div>
  );
};

const ScalerThumb = <
  DataOnStart = undefined,
>(p: {
  setDataOnStart?: (event: HtmlEvent<PointerEvent>) => DataOnStart;
  useScalar: (scalar: Position, onStart: DataOnStart) => void;
}) => {
  const [getDataOnStart, setDataOnStart] = createSignal<DataOnStart>();
  const [getInActionStart, setInActionStart] = createSignal<Position>();

  return (
    <div
      class={styles.ScalerThumb}
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDataOnStart(() => p.setDataOnStart?.(event));
        setInActionStart(Position.from({
          x: event.clientX,
          y: event.clientY,
        }));
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const start = getInActionStart();
        if (!start) return;
        const offset = Position.from({
          x: event.clientX,
          y: event.clientY,
        });
        const scalar = Calc["-"](offset, start);
        p.useScalar(scalar, getDataOnStart() as DataOnStart);
      }}
    />
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

const getTargetOffset = (
  event: HtmlEvent<PointerEvent>,
  target = event.currentTarget
): Position => {
  const targetRect = target.getBoundingClientRect();
  const offset = {
    x: event.clientX - targetRect.left,
    y: event.clientY - targetRect.top,
  };
  return offset;
};
