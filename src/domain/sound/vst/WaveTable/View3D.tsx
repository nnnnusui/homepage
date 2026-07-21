import { ComponentProps, createEffect, onCleanup, onMount } from "solid-js";

import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { useTheme } from "~/fn/state/root/useTheme";
import { useWaveTableContext } from "./createWaveTable";
import { createWaveTableDraw } from "./createWaveTableDraw";

export const View3D = (p: ComponentProps<"canvas">) => {
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

  createEffect(() => {
    void context.instance.samples;
    void context.state().currentMorphRatio;
    rafId = requestAnimationFrame(draw);
  });

  onMount(() => {
    rafId = requestAnimationFrame(draw);
  });

  onCleanup(() => {
    if (rafId != null) cancelAnimationFrame(rafId);
  });

  return (
    <canvas {...p}
      ref={chainUseRef([(el) => canvasRef = el, p.ref])}
      class={cn("size-full", p.class)}
    />
  );
};
