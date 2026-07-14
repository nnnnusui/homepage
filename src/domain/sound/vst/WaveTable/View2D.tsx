import { onCleanup, onMount } from "solid-js";

import { useTheme } from "~/fn/state/root/useTheme";
import { useWaveTableContext } from "./createWaveTable";

export const View2D = () => {
  const context = useWaveTableContext();
  const currentWave = () => context.currentWave;
  const theme = useTheme();
  let canvasRef!: HTMLCanvasElement;
  let rafId: number | undefined;

  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    return { width, height, dpr };
  };

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    wave: Float32Array<ArrayBufferLike>,
    width: number,
    height: number,
  ) => {
    const centerY = height * 0.5;
    const amplitude = Math.max(1, height * 0.42);
    const stepX = wave.length > 1 ? width / (wave.length - 1) : width;

    ctx.beginPath();
    for (let i = 0; i < wave.length; i += 1) {
      const x = i * stepX;
      const y = centerY - clamp(wave[i] ?? 0, -1, 1) * amplitude;
      if (i === 0) {
        ctx.moveTo(x, y);
      }
      else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const draw = (p: {
    color: {
      base: string;
      main: string;
      accent: string;
    };
  }) => {
    const canvas = canvasRef;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, dpr } = resizeCanvas(canvas);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = p.color.base;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = p.color.main;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    const wave = currentWave();
    if (!wave || wave.length === 0) return;

    ctx.strokeStyle = p.color.accent;
    ctx.lineWidth = 2;
    drawWave(ctx, wave, width, height);
  };

  const loop = () => {
    draw({ color: theme });
    rafId = requestAnimationFrame(loop);
  };

  onMount(() => {
    rafId = requestAnimationFrame(loop);
  });

  onCleanup(() => {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
    }
  });

  return <canvas ref={canvasRef} class="size-full" />;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
