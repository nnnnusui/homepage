import { createElementSize } from "@solid-primitives/resize-observer";
import {
  Component, createEffect, createSignal,
} from "solid-js";

import styles from "./AudioVisualizer.module.styl";

import { useColors } from "@/fn/state/root/colors";

type Props = {
  analyser: AnalyserNode
}
export const AudioVisualizer: Component<Props> = (props) => {
  const [colors] = useColors;
  const [getCanvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const size = createElementSize(() => getCanvas());
  const [getContext, setContext] = createSignal<CanvasRenderingContext2D | null>();
  const analyser = () => props.analyser;

  const renderWave = () => {
    const context = getContext();
    if (!context) return;
    const canvas = context.canvas;
    context.fillStyle = colors.base;
    context.strokeStyle = colors.main;
    const times = new Uint8Array(analyser().fftSize);
    analyser().getByteTimeDomainData(times);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    times.forEach((time, index) => {
      const x = (index / times.length) * canvas.width;
      const y = (1 - (time / 255)) * canvas.height;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
  };

  createEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    setContext(canvas.getContext("2d"));
    let animationAlive = true;
    const animationFrame = () => {
      renderWave();
      if (!animationAlive) return;
      window.requestAnimationFrame(animationFrame);
    };
    window.requestAnimationFrame(animationFrame);
    return () => animationAlive = false;
  });

  return (
    <canvas
      ref={setCanvas}
      class={ styles.AudioVisualizer }
      width={size.width ?? 0}
      height={size.height ?? 0}
    />
  );
};
