import { createMemo, For, onMount } from "solid-js";

import { DragDetector } from "~/components/foundation/detect/DragDetector";
import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { createElementSize } from "~/fn/state/createElementSize";
import { useTheme } from "~/fn/state/root/useTheme";
import { Pos } from "~/type/struct/Pos";
import { Wve, WveValue } from "~/type/struct/Wve";
import { EnvelopeBezier, EnvelopeContextProps, useEnvelopeContext } from "./createEnvelope";

export const View = () => {
  const context = useEnvelopeContext();
  const theme = useTheme();
  let ref!: HTMLElement;
  const size = createElementSize(() => ref);
  const pixelsPerSecond = context.state.partial("scale");

  onMount(() => {
    const width = size().width;
    pixelsPerSecond.set(width / context.maxTime);
  });

  const anchorKinds = ["delay", "attack", "hold", "decay", "release"] as const;
  type AnchorKind = typeof anchorKinds[number];
  type SetterKind = keyof WveValue<EnvelopeContextProps["state"]>;
  type EnvelopeAnchor = { kind: AnchorKind; time: number; gain: number; valueKind?: SetterKind };

  const normalizePosToViewBox = (pos: Pos) => {
    return Pos.from({ x: pos.x * pixelsPerSecond(), y: viewBoxHeight - pos.y * viewBoxHeight });
  };
  const normalizeDeltaToViewBox = (pos: Pos) => {
    return Pos.from({ x: pos.x * pixelsPerSecond(), y: -pos.y * viewBoxHeight });
  };

  const getEnvelopeValueFromViewBoxPos = (pos: Pos) => {
    const time = pos.x / pixelsPerSecond();
    const gain = (viewBoxHeight - pos.y) / viewBoxHeight;
    return { time, gain };
  };
  const getEnvelopeSetter = (timeSetterKind: SetterKind, valueSetterKind?: SetterKind) => (e: { start: { time: number; gain: number }; delta: Pos }) => {
    context.state.set(timeSetterKind, e.start.time + e.delta.x / pixelsPerSecond());
    if (valueSetterKind) context.state.set(valueSetterKind, (e.start.gain - (e.delta.y / viewBoxHeight)));
  };

  const anchorMap = (): Record<AnchorKind, EnvelopeAnchor> => ({
    delay: { kind: "delay", time: context.state().delay, gain: 0 },
    attack: { kind: "attack", time: context.state().attack, gain: 1 },
    hold: { kind: "hold", time: context.state().hold, gain: 1 },
    decay: { kind: "decay", time: context.state().decay, gain: context.state().sustain, valueKind: "sustain" },
    release: { kind: "release", time: context.state().release, gain: 0 },
  });
  const relativeAnchorValues = createMemo<EnvelopeAnchor[]>(() => {
    const map = anchorMap();
    return ([
      map.delay,
      map.attack,
      map.hold,
      map.decay,
      map.release,
    ] as const);
  });
  const anchorOffsetMap = createMemo(() => relativeAnchorValues()
    .reduce((p, it) => {
      p.result[it.kind] = { offset: p.sumTime };
      return { result: p.result, sumTime: p.sumTime + it.time };
    }, { sumTime: 0, result: {} as Record<AnchorKind, { offset: number }> })
    .result,
  );
  const pathData = () => relativeAnchorValues()
    .reduce((p, it) => {
      p.result.push({ ...it, gainOffset: p.prevGain, timeOffset: p.sumTime });
      return { result: p.result, sumTime: p.sumTime + it.time, prevGain: it.gain };
    }, { sumTime: 0, prevGain: 0, result: [] as { kind: string; time: number; gain: number; gainOffset: number; timeOffset: number }[] })
    .result
    .map((it) => {
      const offset = normalizePosToViewBox({ x: it.timeOffset, y: it.gainOffset });
      const target = normalizePosToViewBox({ x: it.time + it.timeOffset, y: it.gain });
      const delta = normalizeDeltaToViewBox({ x: it.time, y: it.gain - it.gainOffset });
      if (it.kind === "delay") return `M ${target.x} ${target.y}`;
      if (it.kind === "attack") return getBezierPathFormatted({ curve: context.state().attackCurve, offset, delta });
      if (it.kind === "decay") return getBezierPathFormatted({ curve: context.state().decayCurve, offset, delta });
      if (it.kind === "release") return getBezierPathFormatted({ curve: context.state().releaseCurve, offset, delta });
      return `L ${target.x} ${target.y}`;
    })
    .join(" ");

  const verticalGridStepX = () => Math.max(0.5 * pixelsPerSecond(), 1);

  return (
    <div class="relative size-full min-h-25"
      ref={chainUseRef([(el) => ref = el])}
    >
      <svg viewBox={`0 0 ${size().width} 100`}
        class="size-full"
      >
        <defs>
          <pattern
            id="envelope-grid-pattern"
            patternUnits="userSpaceOnUse"
            width={verticalGridStepX()}
            height="25"
          >
            <path
              d={`M ${verticalGridStepX()} 0 L 0 0 0 25`}
              fill="none"
              stroke="rgba(148, 163, 184, 0.16)"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100" fill="url(#envelope-grid-pattern)" />
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke="rgba(148, 163, 184, 0.16)" stroke-width="1" />
        <line x1="100%" y1="0" x2="100%" y2="100%" stroke="rgba(148, 163, 184, 0.16)" stroke-width="1" />
        <path d={pathData()} fill="none" stroke={theme.accent} stroke-width="2" />
        {/* <For each={points()}>{(point) => (
            <g>
              <circle cx={point.x} cy={point.y} r="4" fill={theme.accent} />
              <text x={point.x + 6} y={point.y - 8} font-size="11" fill="rgba(226, 232, 240, 0.9)">
                {point.time.toFixed(2)}s / {point.value.toFixed(2)}
              </text>
            </g>
          )}</For> */}
      </svg>
      <div class={cn("InteractLayer", "absolute inset-0")}>
        <For each={anchorKinds}>{(kind) => (
          <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
            style={{
              left: `${(anchorMap()[kind]!.time + anchorOffsetMap()[kind]!.offset) * pixelsPerSecond()}px`,
              top: `${100 - anchorMap()[kind]!.gain * 100}%`,
            }}
            startState={() => anchorMap()[kind]!}
            onDrag={getEnvelopeSetter(kind, anchorMap()[kind]!.valueKind)}
            dragContainer={ref}
          />
        )}</For>
        <AttackBezier />
        <DecayBezier />
        <ReleaseBezier />
      </div>
    </div>
  );
};

const viewBoxHeight = 100;
const AttackBezier = () => {
  const context = useEnvelopeContext();
  const pixelsPerSecond = context.state.partial("scale");
  const timeOffset = () => context.state().delay;
  const time = () => context.state().attack;
  const curve = () => context.state().attackCurve;

  const normalizePosToViewBox = (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: viewBoxHeight - pos.y * viewBoxHeight });
  const normalizeDeltaToViewBox = (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: -pos.y * viewBoxHeight });
  const bezier = () => getBezierFormatted({
    curve: curve(),
    offset: normalizePosToViewBox({ x: timeOffset(), y: 0 }),
    delta: normalizeDeltaToViewBox({ x: time(), y: 1 }),
  });

  return (
    <>
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x1}px`, top: `${bezier().y1}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          context.state.set("attackCurve", "x1", e.start.x1 + (e.delta.x / pixelsPerSecond() / time()));
          context.state.set("attackCurve", "y1", e.start.y1 + -e.delta.y / viewBoxHeight);
        }}
        dragContainer={document.body}
      />
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x2}px`, top: `${bezier().y2}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          context.state.set("attackCurve", "x2", e.start.x2 + e.delta.x / pixelsPerSecond() / time());
          context.state.set("attackCurve", "y2", e.start.y2 + -e.delta.y / viewBoxHeight);
        }}
        dragContainer={document.body}
      />
    </>
  );
};

const DecayBezier = () => {
  const context = useEnvelopeContext();
  const timeOffset = () => context.state().delay + context.state().attack + context.state().hold;
  const time = () => context.state().decay;
  const gainDelta = () => (1 - context.state().sustain) * -1;
  const curveKind = () => "decayCurve" as const;

  const pixelsPerSecond = context.state.partial("scale");
  const curve = () => context.state()[curveKind()];

  const normalizePosToViewBox = (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: viewBoxHeight - pos.y * viewBoxHeight });
  const normalizeDeltaToViewBox = (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: -pos.y * viewBoxHeight });
  const bezier = () => getBezierFormatted({
    curve: curve(),
    offset: normalizePosToViewBox({ x: timeOffset(), y: 1 }),
    delta: normalizeDeltaToViewBox({ x: time(), y: gainDelta() }),
  });

  return (
    <>
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x1}px`, top: `${bezier().y1}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          context.state.set(curveKind(), "x1", e.start.x1 + (e.delta.x / pixelsPerSecond() / time()));
          context.state.set(curveKind(), "y1", e.start.y1 + -e.delta.y / viewBoxHeight / gainDelta());
        }}
        dragContainer={document.body}
      />
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x2}px`, top: `${bezier().y2}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          context.state.set(curveKind(), "x2", e.start.x2 + e.delta.x / pixelsPerSecond() / time());
          context.state.set(curveKind(), "y2", e.start.y2 + -e.delta.y / viewBoxHeight / gainDelta());
        }}
        dragContainer={document.body}
      />
    </>
  );
};

const ReleaseBezier = () => {
  const context = useEnvelopeContext();
  const timeOffset = () => context.state().delay + context.state().attack + context.state().hold + context.state().decay;
  const time = () => context.state().release;
  const gainOffset = () => context.state().sustain;
  const gainDelta = () => (context.state().sustain) * -1;
  const curveKind = () => "releaseCurve" as const;

  const pixelsPerSecond = context.state.partial("scale");
  const curve = () => context.state()[curveKind()];

  const normalizePosToViewBox = (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: viewBoxHeight - pos.y * viewBoxHeight });
  const normalizeDeltaToViewBox = (pos: Pos) => Pos.from({ x: pos.x * pixelsPerSecond(), y: -pos.y * viewBoxHeight });
  const bezier = () => getBezierFormatted({
    curve: curve(),
    offset: normalizePosToViewBox({ x: timeOffset(), y: gainOffset() }),
    delta: normalizeDeltaToViewBox({ x: time(), y: gainDelta() }),
  });

  return (
    <>
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x1}px`, top: `${bezier().y1}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          context.state.set(curveKind(), "x1", e.start.x1 + (e.delta.x / pixelsPerSecond() / time()));
          context.state.set(curveKind(), "y1", e.start.y1 + -e.delta.y / viewBoxHeight / gainDelta());
        }}
        dragContainer={document.body}
      />
      <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
        style={{ left: `${bezier().x2}px`, top: `${bezier().y2}px` }}
        startState={() => Wve.unwrap(curve())}
        onDrag={(e) => {
          context.state.set(curveKind(), "x2", e.start.x2 + e.delta.x / pixelsPerSecond() / time());
          context.state.set(curveKind(), "y2", e.start.y2 + -e.delta.y / viewBoxHeight / gainDelta());
        }}
        dragContainer={document.body}
      />
    </>
  );
};

const getBezierFormatted = (p: { curve: EnvelopeBezier; offset: Pos; delta: Pos }) => {
  const x1 = p.offset.x + p.curve.x1 * p.delta.x;
  const x2 = p.offset.x + p.curve.x2 * p.delta.x;
  const y1 = p.offset.y + p.curve.y1 * p.delta.y;
  const y2 = p.offset.y + p.curve.y2 * p.delta.y;
  return { x1, y1, x2, y2 };
};

const getBezierPathFormatted = (p: { curve: EnvelopeBezier; offset: Pos; delta: Pos }) => {
  const x1 = p.offset.x + p.curve.x1 * p.delta.x;
  const x2 = p.offset.x + p.curve.x2 * p.delta.x;
  const y1 = p.offset.y + p.curve.y1 * p.delta.y;
  const y2 = p.offset.y + p.curve.y2 * p.delta.y;
  return `C ${x1} ${y1}, ${x2} ${y2}, ${p.offset.x + p.delta.x} ${p.offset.y + p.delta.y}`;
};
