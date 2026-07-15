import { onCleanup, onMount } from "solid-js";

import { useTheme } from "~/fn/state/root/useTheme";
import { useWaveTableContext } from "./createWaveTable";
import { createWaveTableDraw } from "./createWaveTableDraw";

export const View3D = () => {
  const context = useWaveTableContext();
  const theme = useTheme();
  let canvasRef!: HTMLCanvasElement;
  let rafId: number | undefined;

  const draw = createWaveTableDraw({
    get morphTable() { return context.instance.samples; },
    get canvas() { return canvasRef; },
    get currentMorphRatio() { return context.state().currentMorphRatio; },
    color: theme,
  });

  const drawAndLoop = (timeMs: number) => {
    draw(timeMs);
    rafId = requestAnimationFrame(drawAndLoop);
  };

  onMount(() => {
    rafId = requestAnimationFrame(drawAndLoop);
  });

  onCleanup(() => {
    if (rafId != null) cancelAnimationFrame(rafId);
  });

  return (
    <canvas ref={canvasRef} class="size-full" />
  );
};
