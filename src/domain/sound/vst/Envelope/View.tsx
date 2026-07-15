import { For } from "solid-js";

import { useEnvelopeContext } from "./createEnvelope";

export const View = () => {
  const context = useEnvelopeContext();
  const graph = () => context.graph;
  const width = 720;
  const height = 260;
  const paddingX = 24;
  const paddingY = 20;

  const points = () => graph().points.map((point) => {
    const normalizedTime = point.time / Math.max(graph().totalTime, 0.001);
    return {
      x: paddingX + normalizedTime * (width - paddingX * 2),
      y: paddingY + (1 - point.value) * (height - paddingY * 2),
      time: point.time,
      value: point.value,
    };
  });

  const pathData = () => points()
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const sampledPoints = () => graph().sampledPoints.map((point) => {
    const normalizedTime = point.time / Math.max(graph().totalTime, 0.001);
    return {
      x: paddingX + normalizedTime * (width - paddingX * 2),
      y: paddingY + (1 - point.value) * (height - paddingY * 2),
      time: point.time,
      value: point.value,
    };
  });

  const sampledPathData = () => sampledPoints()
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const gridY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <section class="flex flex-col gap-3 w-full rounded-lg border border-slate-700/70 p-4">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-slate-100">Envelope View</h2>
          <p class="text-sm text-slate-300">Preview of delay, attack, hold, decay, sustain, and release.</p>
        </div>
        <div class="text-xs text-slate-400">
          Total {graph().totalTime.toFixed(3)}s
        </div>
      </header>

      <svg viewBox={`0 0 ${width} ${height}`} class="w-full overflow-visible rounded-md bg-slate-950/70">
        <rect x="0" y="0" width={width} height={height} fill="rgba(2, 6, 23, 0.75)" />

        <For each={gridY}>{(value) => {
          const y = paddingY + (1 - value) * (height - paddingY * 2);
          return (
            <g>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(148, 163, 184, 0.16)"
                stroke-width="1"
              />
              <text x="6" y={y + 4} font-size="11" fill="rgba(148, 163, 184, 0.8)">{value.toFixed(2)}</text>
            </g>
          );
        }}</For>

        <path d={sampledPathData()} fill="none" stroke="rgba(34, 211, 238, 1)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />

        <path d={pathData()} fill="none" stroke="rgba(148, 163, 184, 0.4)" stroke-width="1" stroke-dasharray="4 4" />

        <For each={points()}>{(point) => (
          <g>
            <circle cx={point.x} cy={point.y} r="4" fill="rgba(34, 211, 238, 1)" />
            <text x={point.x + 6} y={point.y - 8} font-size="11" fill="rgba(226, 232, 240, 0.9)">
              {point.time.toFixed(2)}s / {point.value.toFixed(2)}
            </text>
          </g>
        )}</For>
      </svg>
    </section>
  );
};
