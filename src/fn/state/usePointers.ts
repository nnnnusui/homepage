import {
  createEffect,
} from "solid-js";
import { createStore } from "solid-js/store";

import { HtmlEvent } from "@/type/HtmlEvent";

export const usePointers = (
  effect: (pointers: Pointer[]) => void
) => {
  const [pointers, setPointers] = createStore<Pointer[]>([]);
  createEffect(() => effect(pointers));

  return {
    get get() { return pointers; },
    get set() {
      return {
        state: setPointers,
        getEventListeners: () => {
          const onPointerDown = (event: HtmlEvent<PointerEvent>) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            const pointer = getPointerFromEvent(event);
            setPointers(pointers.length, pointer);
          };
          const onPointerMove = (event: HtmlEvent<PointerEvent>) => {
            const pointer = getPointerFromEvent(event);
            setPointers((it) => it.pointerId === pointer.pointerId, pointer);
          };
          const onPointerUp = (event: HtmlEvent<PointerEvent>) => {
            setPointers((prev) => prev.filter((it) =>
              it.pointerId !== event.pointerId,
            ));
          };
          return {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
            onPointerLeave: onPointerUp,
          };
        },
      };
    },
  };
};

type Pointer = {
  raw: HtmlEvent<PointerEvent>;
  pointerId: number;
  currentOffsetX: number;
  currentOffsetY: number;
}

const getPointerFromEvent = (event: HtmlEvent<PointerEvent>): Pointer => {
  const targetRect = event.currentTarget.getBoundingClientRect();
  return {
    raw: event,
    pointerId: event.pointerId,
    currentOffsetX: event.clientX - targetRect.left,
    currentOffsetY: event.clientY - targetRect.top,
  };
};
