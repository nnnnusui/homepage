import { createElementSize } from "@solid-primitives/resize-observer";
import clsx from "clsx";
import {
  JSX,
  createSignal,
} from "solid-js";

import { useGpuCanvas } from "@/fn/state/useGpuCanvas";

import styles from "./WebGpuViewer.module.styl";

export const WebGpuViewer = (p: {
  class?: string;
}): JSX.Element => {
  const [getContainer, setContainer] = createSignal<HTMLDivElement>();
  const [getCanvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const size = createElementSize(() => getContainer());
  useGpuCanvas({
    canvas: getCanvas,
    wgsl: () => `
      struct VertexInput {
        @location(0) pos: vec2f,
        @builtin(instance_index) instanceIndex: u32,
      };
      
      struct VertexOutput {
        @builtin(position) pos: vec4f,
        @location(0) cell: vec2f,
      };

      @group(0) @binding(0) var<uniform> grid: vec2f;
      // @group(0) @binding(1) var<storage> cellInputs: array<u32>;
      // @group(0) @binding(2) var<storage, read_write> cellOutputs: array<u32>;

      @vertex
      fn vertexMain(p: VertexInput) -> VertexOutput {
        let index = f32(p.instanceIndex);
        let cell = vec2f(index % grid.x, floor(index / grid.x));
        let cellOffset = cell / grid * 2;
        let gridPos = (p.pos + 1) / grid - 1 + cellOffset;

        var output: VertexOutput;
        output.pos = vec4f(gridPos, 0, 1);
        output.cell = cell;
        return output;
      }
      
      @fragment
      fn fragmentMain(p: VertexOutput) -> @location(0) vec4f {
        let vec2 = p.cell / grid;
        let color = vec3f(vec2, 1 - vec2.x);
        return vec4f(color, 1);
      }
    `,
  });

  return (
    <div
      ref={setContainer}
      class={clsx(styles.WebGpuViewer, p.class)}
    >
      <canvas
        ref={setCanvas}
        width={size.width ?? 0}
        height={size.height ?? 0}
      />
    </div>
  );
};
