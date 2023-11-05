import {
  JSX,
  createEffect,
  createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";

import { Calc } from "@/fn/calc";
import { merge } from "@/fn/merge";
import { toPartial } from "@/fn/toPartial";
import { DeepPartial } from "@/type/DeepPartial";
import { Camera } from "@/type/struct/Camera";
import { Position } from "@/type/struct/Position";
import { Size } from "@/type/struct/Size";

import { usePointers } from "./usePointers";

export const createCamera = (args?: {
  initState?: DeepPartial<Camera>;
  bound?: {
    position?: {
      min?: DeepPartial<Position>;
      max?: DeepPartial<Position>;
    };
  };
}) => {
  const initState = Camera.from(args?.initState ?? {});
  const [state, setState] = createStore(initState);
  const translate = () => Calc.opposite(state.position);

  const setScale = (
    setter: Size | ((prev: Size) => Size),
    options?: {
      origin: Position;
      nextOrigin?: Position;
      prev?: Camera;
    }
  ) => {
    setState((prev) => {
      const prevScale = options?.prev?.scale ?? prev.scale;
      const nextScaleRaw = typeof setter === "function" ? setter(prevScale) : setter;
      const nextScale = Calc.orElse((it) => isFinite(it) && 0 < it)(nextScaleRaw, prevScale);
      const prevPosition = options?.prev?.position ?? prev.position;
      const nextPosition = (() => {
        if (options){
          const origin = options.origin;
          const nextOrigin = options.nextOrigin ?? origin;
          return Position.scaled({
            prev: prevPosition,
            prevOrigin: origin,
            nextOrigin: nextOrigin,
            prevScale: prevScale,
            nextScale: nextScale,
          });
        } else {
          return prevPosition;
        }
      })();
      return {
        scale: nextScale,
        position: nextPosition,
      };
    });
  };

  const [stateInAction, setStateInAction] = createSignal<{
    pointsCount: number;
    distance: Size;
    origin: Position;
    camera: Camera;
  }>();
  const inAction = () => stateInAction()?.pointsCount !== 0 ?? false;
  const setByPositions = (
    points: Position[],
    keepRatio = false,
  ) => {
    if (points.length === 0) {
      setStateInAction();
      return;
    }
    const onDown = stateInAction();
    if (onDown?.pointsCount !== points.length) {
      const sumMax = points.reduce((max, it) => Calc.max(max, it), Position.init());
      const distance = Calc.positiveDiff(
        sumMax,
        points.reduce((min, it) => Calc.min(min, it), sumMax),
      );
      const origin = Calc["/"](
        points.reduce((sum, it) => Calc["+"](sum, it), Position.init()),
        Math.max(1, points.length),
      );
      setStateInAction(() => ({
        pointsCount: points.length,
        origin: origin,
        distance: Size.fromPosition(distance),
        camera: { ...state },
      }));
    } else {
      if (points.length === 0) return;
      const sumMax = points.reduce((max, it) => Calc.max(max, it), Position.init());
      const sumMin = points.reduce((min, it) => Calc.min(min, it), sumMax);
      const distance = Calc.positiveDiff(sumMax, sumMin);
      const origin = Calc["/"](
        points.reduce((sum, it) => Calc["+"](sum, it), Position.init()),
        points.length,
      );
      const current = {
        distance: Size.fromPosition(distance),
        origin,
      };
      const scaleScalarRaw = Calc["/"](current.distance, onDown.distance);
      const scaleScalar
          = keepRatio
            ? Math.max(scaleScalarRaw.width, scaleScalarRaw.height)
            : scaleScalarRaw;
      const nextScale = Calc["*"](onDown.camera.scale, scaleScalar);
      setScale(nextScale, {
        origin: onDown.origin,
        nextOrigin: current.origin,
        prev: onDown.camera,
      });
    }
  };

  // translate bound.
  createEffect(() => {
    const onDown = stateInAction();
    if (onDown) return;
    if (!args?.bound?.position) return;
    const min = merge(Position.from(Number.NEGATIVE_INFINITY), args?.bound?.position?.min ?? {});
    const max = merge(Position.from(Number.POSITIVE_INFINITY), args?.bound?.position?.max ?? {});
    setState("position", (prev) => Calc.clamp(prev, min, max));
  });

  const range = (): Position => {
    const min = merge(Position.from(Number.NEGATIVE_INFINITY), args?.bound?.position?.min ?? {});
    const max = merge(Position.from(Number.POSITIVE_INFINITY), args?.bound?.position?.max ?? {});
    const range = Calc["-"](max, min);
    return range;
  };
  const progress = (): Position => {
    const current = Calc["/"](state.position, range());
    return current;
  };

  // scale and translate by pointers
  const { set: setPointers } = usePointers((pointers) => {
    const points = pointers.map((pointer) => ({
      x: pointer.currentOffsetX,
      y: pointer.currentOffsetY,
    }));
    setByPositions(points, true);
  });

  return {
    get get() {
      return {
        get state() { return state; },
        get scale() { return state.scale; },
        get position() { return state.position; },
        get translate() { return translate(); },
        get range() { return range(); },
        get progress() { return progress(); },
        get inAction() { return inAction(); },
        absAtFromAtCamera: (atCamera: Position) =>  {
          const atScaled = Calc["+"](state.position, atCamera);
          const absAt = Calc["/"](atScaled, Position.fromSize(state.scale));
          return absAt;
        },
      };
    },
    get set() {
      return {
        state: setState,
        scale: (next: DeepPartial<Size>) =>
          toPartial(setState)("scale")((prev) => merge(prev, next)),
        position: (next: DeepPartial<Position>) =>
          toPartial(setState)("position")((prev) => merge(prev, next)),
        translate: (next: DeepPartial<Position>) =>
          toPartial(setState)("position")((prev) => merge(prev, Calc.opposite(next))),
        byPositions: setByPositions,
        init: () => setState(initState),
        getEventListeners: (args: {
          scaleRatioOnWheel: Size;
        }) => {
          const onWheel: JSX.EventHandlerUnion<HTMLElement, WheelEvent>
            = (event) => {
              const targetRect = event.currentTarget.getBoundingClientRect();
              const cursorOnScreen = {
                x: event.clientX - targetRect.left,
                y: event.clientY - targetRect.top,
              };
              const scalar = args.scaleRatioOnWheel;
              const calculator = event.deltaY < 0 ? "/" : "*";
              setScale((prev) => Calc[calculator](prev, scalar), { origin: cursorOnScreen });
            };
          return {
            ...setPointers.getEventListeners(),
            onWheel,
          };
        },
      };
    },
  };
};
