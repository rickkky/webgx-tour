import type { WebGPUInitRenderProps } from '@/components/canvas/WebGPUCanvas';
import shaderSource from './shader.wgsl';
import initState from './state';

function initRender(props: WebGPUInitRenderProps) {
  const { context, device, onResize } = props;

  const state = initState(props);

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'premultiplied',
  });

  const shader = device.createShaderModule({
    label: 'shader module',
    code: shaderSource,
  });
  const pipeline = device.createRenderPipeline({
    label: 'pipline',
    layout: 'auto',
    vertex: {
      module: shader,
      entryPoint: 'vs',
      buffers: [
        {
          arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    fragment: {
      module: shader,
      entryPoint: 'fs',
      targets: [
        {
          format: presentationFormat,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add',
            },
          },
        },
      ],
    },
  });

  const positionBuf = device.createBuffer({
    label: 'vertex buffer',
    size: state.positions.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  state.$on('positions', (state) => {
    device.queue.writeBuffer(positionBuf, 0, state.positions);
  });

  const colorBuf = device.createBuffer({
    label: 'color buffer',
    size: state.colors.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  state.$on('colors', (state) => {
    device.queue.writeBuffer(colorBuf, 0, state.colors);
  });

  const resolutions = new Float32Array(2);
  const resolutionBuf = device.createBuffer({
    label: 'resolution buffer',
    size: 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  onResize(({ width, height }) => {
    resolutions.set([width, height]);
    device.queue.writeBuffer(resolutionBuf, 0, resolutions);
  });

  const bindGroup = device.createBindGroup({
    label: 'bind group',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: colorBuf,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: resolutionBuf,
        },
      },
    ],
  });

  const render = () => {
    const encoder = device.createCommandEncoder({
      label: 'encoder',
    });
    const pass = encoder.beginRenderPass({
      label: 'render pass',
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: [1, 1, 1, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, positionBuf);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  return render;
}

export default initRender;
