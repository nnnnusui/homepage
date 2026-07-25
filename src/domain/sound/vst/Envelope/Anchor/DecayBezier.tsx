import { DragDetector } from "~/components/foundation/detect/DragDetector";
import { Wve } from "~/type/struct/Wve";
import { useEnvelopeContext } from "../createEnvelope";

export const DecayBezier = () => {
  const context = useEnvelopeContext();
  const curveKind = () => "decayCurve" as const;
  const time = () => context.state().decay;
  const gainDelta = () => (1 - context.state().sustain) * -1;
  const timeOffset = () => context.state().delay + context.state().attack + context.state().hold;
  const gainOffset = () => 1;

  const curve = () => context.state()[curveKind()];
  const bezier = () => context.normalizeBezier({
    curve: curve(),
    offset: context.normalizePosToViewBox({ x: timeOffset(), y: gainOffset() }),
    delta: context.normalizeDeltaToViewBox({ x: time(), y: gainDelta() }),
  });

  return (
    <>
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x1}px`, top: `${bezier().y1}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          const delta = context.ratioDeltaFromViewBoxDelta(e.delta, { time, gainDelta });
          context.state.set(curveKind(), "x1", e.start.x1 + delta.x);
          context.state.set(curveKind(), "y1", e.start.y1 + delta.y);
        }}
        dragContainer={document.body}
      />
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x2}px`, top: `${bezier().y2}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          const delta = context.ratioDeltaFromViewBoxDelta(e.delta, { time, gainDelta });
          context.state.set(curveKind(), "x2", e.start.x2 + delta.x);
          context.state.set(curveKind(), "y2", e.start.y2 + delta.y);
        }}
        dragContainer={document.body}
      />
    </>
  );
};
