import { kolor } from '@/common/color';
import { bindSignal } from '@/common/pane';
import { WebGPURenderer } from '@/common/renderer';
import { computed, effect, signal } from '@/common/signal';

import shaderSource from './shader.wgsl';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    width * 1 / 10, height * 9 / 10,
    width * 9 / 10, height * 9 / 10,
    width * 5 / 10, height * 1 / 10,
  ]
}

class Renderer extends WebGPURenderer {
  state = {
    color1: signal('#ff000080'),
    color2: signal('#00ff0080'),
    color3: signal('#0000ff80'),
  };

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });
    bindSignal(folder, this.state.color1, {
      label: 'color 1',
    });
    bindSignal(folder, this.state.color2, {
      label: 'color 2',
    });
    bindSignal(folder, this.state.color3, {
      label: 'color 3',
    });
  }

  async initRender() {
    const context = this.context;
    const device = this.device;

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

    const positions = computed(
      () => new Float32Array(triangle(this.width(), this.height())),
    );
    const positionBuf = device.createBuffer({
      label: 'vertex buffer',
      size: positions().byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(positionBuf, 0, positions());
    });

    const colors = computed(
      () =>
        new Float32Array([
          ...kolor(this.state.color1()).rgbanorm().array(),
          ...kolor(this.state.color2()).rgbanorm().array(),
          ...kolor(this.state.color3()).rgbanorm().array(),
        ]),
    );
    const colorBuf = device.createBuffer({
      label: 'color buffer',
      size: colors().byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(colorBuf, 0, colors());
    });

    const resolutions = computed(
      () => new Float32Array([this.width(), this.height()]),
    );
    const resolutionBuf = device.createBuffer({
      label: 'resolution buffer',
      size: resolutions().byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(resolutionBuf, 0, resolutions());
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

    return () => {
      const encoder = device.createCommandEncoder({
        label: 'encoder',
      });
      const pass = encoder.beginRenderPass({
        label: 'render pass',
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: [0, 0, 0, 0],
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
  }
}

export default Renderer;
