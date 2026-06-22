import { ValidComponent, ComponentProps, JSX, splitProps, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { cn } from "~/fn/cn";
import { Pos } from "~/type/struct/Pos";
import { Polymorphic, PolymorphicProps } from "../render/Polymorphic";

import styles from "./DragDetector.module.css";

/** @public */
export const DragDetector = <
  StartState,
  Component extends ValidComponent = "div",
>(_p: PolymorphicProps<
  Component,
  {
    as?: ComponentProps<typeof Dynamic<Component>>["component"];
    startState: () => StartState;
    onDrag: OnDrag<StartState>;
    dragContainer?: HTMLElement;
  }
>) => {
  const [p, wrappedProps] = splitProps(_p, ["as", "startState", "onDrag", "dragContainer"]);

  type Start = {
    pos: Pos;
    state?: StartState;
  };
  const [start, setStart] = createStore<Start>({ pos: { x: 0, y: 0 } });
  const [dragging, setDragging] = createSignal(false);

  const onDrag: OnDrag<StartState> = (event) => p.onDrag(event);

  const onPointerDown: JSX.EventHandler<HTMLElement, PointerEvent> = (event) => {
    wrappedProps.onPointerDown?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    const start: Start = {
      pos: Pos.fromEvent(event, { relativeTo: p.dragContainer }),
      state: p.startState(),
    };
    setStart(start);
    if (start.state == null) return;
    onDrag({
      phase: "start",
      delta: Pos.init(),
      start: start.state,
      raw: event,
    });
  };
  const onPointerMove: JSX.EventHandler<HTMLElement, PointerEvent> = (event) => {
    wrappedProps.onPointerMove?.(event);
    if (event.defaultPrevented) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    event.stopPropagation();
    if (start.state == null) return;
    const movedPos = Pos.fromEvent(event, { relativeTo: p.dragContainer });
    onDrag({
      phase: "preview",
      delta: {
        x: movedPos.x - start.pos.x,
        y: movedPos.y - start.pos.y,
      },
      start: start.state,
      raw: event,
    });
  };
  const onPointerUp: JSX.EventHandler<HTMLElement, PointerEvent> = (event) => {
    wrappedProps.onPointerUp?.(event);
    if (event.defaultPrevented) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    if (start.state == null) return;
    const movedPos = Pos.fromEvent(event, { relativeTo: p.dragContainer });
    onDrag({
      phase: "confirmed",
      delta: {
        x: movedPos.x - start.pos.x,
        y: movedPos.y - start.pos.y,
      },
      start: start.state,
      raw: event,
    });
  };

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? "div"}
      class={cn(styles.DragDetector, wrappedProps.class)}
      classList={{
        [styles.Dragging]: dragging(),
        ...wrappedProps.classList,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
};

/** @public */
export type OnDrag<StartState> = (event: DragEvent<StartState>) => void;

/** @public */
export type DragEvent<StartState> = {
  phase: DragEventPhase;
  delta: Pos;
  start: StartState;
  raw: PointerEvent & { currentTarget: Element };
};

/** @public */
export type DragEventPhase = "start" | "preview" | "confirmed";
