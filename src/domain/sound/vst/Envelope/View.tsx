import { createMemo, onMount, splitProps , ParentProps } from "solid-js";

import { PolymorphicProps, PolymorphicAs, Polymorphic } from "~/components/foundation/render/Polymorphic";
import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { createElementSize } from "~/fn/state/createElementSize";
import { useTheme } from "~/fn/state/root/useTheme";
import { Pos } from "~/type/struct/Pos";
import { EnvelopeBezier, useEnvelopeContext } from "./createEnvelope";

export const View = <As extends PolymorphicAs = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [p, wrappedProps] = splitProps(_p, ["as"]);
  const context = useEnvelopeContext();
  const theme = useTheme();
  let ref!: HTMLElement;
  const size = createElementSize(() => ref);
  const pixelsPerSecond = context.state.partial("scale");

  onMount(() => {
    const width = size().width;
    pixelsPerSecond.set(width / context.maxTime);
  });

  const getBezierPathFormatted = (p: { curve: EnvelopeBezier; offset: Pos; delta: Pos }) => {
    const bezier = context.normalizeBezier(p);
    return `C ${bezier.x1} ${bezier.y1}, ${bezier.x2} ${bezier.y2}, ${p.offset.x + p.delta.x} ${p.offset.y + p.delta.y}`;
  };

  const relativeAnchorValues = createMemo(() => {
    const map = context.anchorMap;
    return ([
      map.delay,
      map.attack,
      map.hold,
      map.decay,
      map.release,
    ] as const);
  });
  const pathData = () => relativeAnchorValues()
    .reduce((p, it) => {
      p.result.push({ ...it, gainOffset: p.prevGain, timeOffset: p.sumTime });
      return { result: p.result, sumTime: p.sumTime + it.time, prevGain: it.gain };
    }, { sumTime: 0, prevGain: 0, result: [] as { kind: string; time: number; gain: number; gainOffset: number; timeOffset: number }[] })
    .result
    .map((it) => {
      const offset = context.normalizePosToViewBox({ x: it.timeOffset, y: it.gainOffset });
      const target = context.normalizePosToViewBox({ x: it.time + it.timeOffset, y: it.gain });
      const delta = context.normalizeDeltaToViewBox({ x: it.time, y: it.gain - it.gainOffset });
      if (it.kind === "delay") return `M ${target.x} ${target.y}`;
      if (it.kind === "attack") return getBezierPathFormatted({ curve: context.state().attackCurve, offset, delta });
      if (it.kind === "decay") return getBezierPathFormatted({ curve: context.state().decayCurve, offset, delta });
      if (it.kind === "release") return getBezierPathFormatted({ curve: context.state().releaseCurve, offset, delta });
      return `L ${target.x} ${target.y}`;
    })
    .join(" ");

  const verticalGridStepX = () => Math.max(0.5 * pixelsPerSecond(), 1);

  return (
    <Polymorphic {...wrappedProps}
      as={p.as ?? defaultAs}
      class={cn("relative size-full min-h-25", wrappedProps.class)}
      ref={chainUseRef([wrappedProps.ref, (el) => ref = el])}
    >
      <svg viewBox={`0 0 ${size().width} ${context.viewBoxHeight}`}
        class="absolute inset-0 size-full"
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
      {wrappedProps.children}
    </Polymorphic>
  );
};

const defaultAs = "div" as const;
