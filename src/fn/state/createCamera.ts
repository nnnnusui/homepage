import {
  JSX,
  Setter,
  createEffect,
  createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";

import { Calc } from "@/fn/calc";
import { merge } from "@/fn/merge";
import { DeepPartial } from "@/type/DeepPartial";
import { Camera } from "@/type/struct/Camera";
import { Position } from "@/type/struct/Position";
import { Size } from "@/type/struct/Size";

import { usePointers } from "./usePointers";

export const createCamera = (args?: {
  initState?: DeepPartial<Camera>;
  bound?: {
    translate?: {
      min?: DeepPartial<Position>;
      max?: DeepPartial<Position>;
    };
  };
}) => {
  const initState = Camera.from(args?.initState ?? {});
  const [state, setState] = createStore(initState);
  const position = () => Calc.opposite(state.translate);

  const setScale: SetScale = (setter, options) => {
    setState((prev) => {
      const prevScale = options?.prevScale ?? prev.scale;
      const nextScaleRaw = typeof setter === "function" ? setter(prevScale) : setter;
      const nextScale = Calc.orElse((it) => isFinite(it) && 0 < it)(nextScaleRaw, prevScale);
      const nextTranslate = (() => {
        if (options){
          const origin = options.origin;
          const nextOrigin = options.nextOrigin ?? origin;
          const prevTranslate = options.prevTranslate ?? prev.translate;
          return getScaledTranslate({
            prevOriginOnScreen: origin,
            nextOriginOnScreen: nextOrigin,
            prevTranslate: prevTranslate,
            prevScale: prevScale,
            nextScale: nextScale,
          });
        } else {
          return prev.translate;
        }
      })();
      return {
        scale: nextScale,
        translate: nextTranslate,
      };
    });
  };

  const [stateInAction, setStateInAction] = createSignal<StateInAction>();
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
        scale: state.scale,
        translate: state.translate,
        origin: origin,
        distance: Size.fromPosition(distance),
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
      const nextScale = Calc["*"](onDown.scale, scaleScalar);
      setScale(nextScale, {
        origin: onDown.origin,
        nextOrigin: current.origin,
        prevScale: onDown.scale,
        prevTranslate: onDown.translate,
      });
    }
  };
  const setTranslate: Setter<Translate>
    = (setter) =>
      setState((prev) => {
        const nextTranslateRaw = typeof setter === "function" ? setter(prev.translate) : setter;
        return {
          ...prev,
          translate: nextTranslateRaw,
        };
      });

  // translate bound.
  createEffect(() => {
    const onDown = stateInAction();
    if (onDown) return;
    if (!args?.bound?.translate) return;
    const min = merge(Position.from(Number.NEGATIVE_INFINITY), args?.bound?.translate?.min ?? {});
    const max = merge(Position.from(Number.POSITIVE_INFINITY), args?.bound?.translate?.max ?? {});
    setState("translate", (prev) => Calc.opposite(Calc.clamp(Calc.opposite(prev), min, max)));
  });

  const range = (): Position => {
    const min = merge(Position.from(Number.NEGATIVE_INFINITY), args?.bound?.translate?.min ?? {});
    const max = merge(Position.from(Number.POSITIVE_INFINITY), args?.bound?.translate?.max ?? {});
    const range = Calc["-"](max, min);
    return range;
  };
  const progress = (): Position => {
    const current = Calc["/"](position(), range());
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
        get translate() { return state.translate; },
        get position() { return position(); },
        get range() { return range(); },
        get progress() { return progress(); },
        get inAction() { return inAction(); },
        absAtFromAtCamera: (atCamera: Position) =>  {
          const atScaled = Calc["+"](position(), atCamera);
          const absAt = Calc["/"](atScaled, Size.toPosition(state.scale));
          return absAt;
        },
      };
    },
    get set() {
      return {
        state: setState,
        translate: setTranslate,
        scale: setScale,
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

const getScaledTranslate = (args: {
  prevOriginOnScreen: Position;
  nextOriginOnScreen: Position;
  prevScale: Size;
  nextScale: Size;
  prevTranslate: Position;
}) => {
  const cameraAtAbsScaled = Calc.opposite(args.prevTranslate);
  const cursorAtAbsScaled = Calc["+"](cameraAtAbsScaled, args.prevOriginOnScreen);
  const cursorAtAbs = Calc["/"](cursorAtAbsScaled, Size.toPosition(args.prevScale));
  const cursorAtAbsNextScaled = Calc["*"](cursorAtAbs, Size.toPosition(args.nextScale));
  const screenAtAbsNextScaled = Calc["-"](cursorAtAbsNextScaled, args.nextOriginOnScreen);
  const nextTranslate = Calc.opposite(screenAtAbsNextScaled);
  return nextTranslate;
};

type SetState<T> = Parameters<Setter<T>>[0]
type Translate = Camera["translate"];
type Scale = Camera["scale"];
type SetScale = (setter: SetState<Scale>, options?: {
  origin: Position;
  nextOrigin?: Position;
  prevScale?: Scale;
  prevTranslate?: Translate;
}) => void;

type StateInAction = {
  pointsCount: number;
  distance: Size;
  origin: Position;
  translate: Translate;
  scale: Scale;
};
