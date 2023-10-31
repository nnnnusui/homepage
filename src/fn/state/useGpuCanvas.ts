import {
  Accessor,
  batch,
  createEffect,
  createSignal,
} from "solid-js";

export const useGpuCanvas = (p: {
  canvas: Accessor<HTMLCanvasElement | undefined>;
  wgsl: Accessor<string>;
}) => {
  const [getContext, setContext] = createSignal<GPUCanvasContext>();
  const [getDevice, setDevice] = createSignal<GPUDevice>();
  createEffect(() => {
    const canvas = p.canvas();
    if (!canvas) return;
    (async () => {
      const gpu = navigator.gpu;
      if (!gpu) throw new Error("WebGPU not supported on this browser.");
      const adapter = await gpu.requestAdapter();
      if (!adapter) throw new Error("No appropriate GPUAdapter found.");
      const device = await adapter.requestDevice();
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
      const context = canvas.getContext("webgpu");
      if (!context) throw new Error("Failed to generate GPUCanvasContext.");
      context.configure({
        device: device,
        format: canvasFormat,
        alphaMode: "premultiplied",
      });
      batch(() => {
        setDevice(device);
        setContext(context);
      });
    })();
  });

  createEffect(() => {
    const device = getDevice();
    if (!device) return;
    const context = getContext();
    if (!context) return;
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    const size = 32;
    const uniformArray = new Float32Array([size, size]);
    const uniformBuffer = device.createBuffer({
      label: "Uniforms",
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray);
    const vertices = new Float32Array([
      -0.8, -0.8,
      0.8, -0.8,
      0.8,  0.8,

      -0.8, -0.8,
      0.8,  0.8,
      -0.8,  0.8,
    ]);
    const vertexBuffer = device.createBuffer({
      label: "Cell vertices",
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);
    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 8,
      attributes: [{
        format: "float32x2",
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
      }],
    };
    const shaderModule = device.createShaderModule({
      label: "shader",
      code: p.wgsl(),
    });
    const pipeline = device.createRenderPipeline({
      label: "pipeline",
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{
          format: canvasFormat,
        }],
      },
    });
    const bindGroup = device.createBindGroup({
      label: "Renderer bind group",
      layout: pipeline.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: uniformBuffer },
      }],
    });
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setBindGroup(0, bindGroup);
    pass.draw(vertices.length / 2, size * size);

    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    device.queue.submit([encoder.finish()]);
  });

  return [
  ] as const;
};
