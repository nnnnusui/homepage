import {
  JSX,
  createEffect,
} from "solid-js";
import { createStore } from "solid-js/store";

type EventHandler = JSX.EventHandler<HTMLElement, PointerEvent>
type EventHandlerArg = Parameters<EventHandler>[0]
type Pointer = {
  raw: EventHandlerArg;
  pointerId: number;
  currentOffsetX: number;
  currentOffsetY: number;
}
type Pointers = Pointer[];
export const usePointers = (
  effect: (pointers: Pointers) => void
) => {
  const [pointers, setPointers] = createStore<Pointers>([]);
  createEffect(() => effect(pointers));

  const getPointerFromEvent = (event: EventHandlerArg): Pointer => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    return {
      raw: event,
      pointerId: event.pointerId,
      currentOffsetX: event.clientX - targetRect.left,
      currentOffsetY: event.clientY - targetRect.top,
    };
  };

  return {
    get get() { return pointers; },
    get set() {
      return {
        state: setPointers,
        getEventListeners: () => {
          const onPointerDown: EventHandler
            = (event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              const pointer = getPointerFromEvent(event);
              setPointers(pointers.length, pointer);
            };
          const onPointerMove: EventHandler
            = (event) => {
              const pointer = getPointerFromEvent(event);
              setPointers((prev) => prev.map((it) =>
                it.pointerId === pointer.pointerId
                  ? pointer
                  : it
              ));
            };
          const onPointerUp: EventHandler
            = (event) => {
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
