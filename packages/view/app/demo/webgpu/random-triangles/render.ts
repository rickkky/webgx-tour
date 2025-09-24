import { kolor } from '@/common/color';
import { random } from '@/common/math';
import { bindSignal } from '@/common/pane';
import { WebGPURenderer } from '@/common/renderer';
import { computed, effect, signal } from '@/common/signal';

import shaderSource from './shader.wgsl';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    -width * 1 / 10,  height * 1 / 10,
     width * 1 / 10,  height * 1 / 10,
     width * 0 / 10, -height * 1 / 10,
  ]
}

class Renderer extends WebGPURenderer {
  state = {
    count: signal(10),
    countMax: 100,
    countMin: 1,
  };

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });
    bindSignal(folder, this.state.count, {
      label: 'count',
      min: this.state.countMin,
      max: this.state.countMax,
      step: 1,
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
      label: 'position buffer',
      size: positions().byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(positionBuf, 0, positions());
    });

    const scalings = computed(
      () =>
        new Float32Array(
          Array(this.state.count())
            .fill(0)
            .map(() => random(0.5, 2)),
        ),
    );
    const scalingBuf = device.createBuffer({
      label: 'scaling buffer',
      size: this.state.countMax * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(scalingBuf, 0, scalings());
    });

    const offsets = computed(
      () =>
        new Float32Array(
          Array(this.state.count())
            .fill(0)
            .flatMap(() => [
              random(-(this.width() * 3) / 10, (this.width() * 3) / 10),
              random(-(this.height() * 3) / 10, (this.height() * 3) / 10),
            ]),
        ),
    );
    const offsetBuf = device.createBuffer({
      label: 'offset buffer',
      size: this.state.countMax * 2 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(offsetBuf, 0, offsets());
    });

    const colors = computed(
      () =>
        new Float32Array(
          Array(this.state.count() * 3)
            .fill(0)
            .flatMap(() => kolor.random(0.5).rgbanorm().array()),
        ),
    );
    const colorBuf = device.createBuffer({
      label: 'color buffer',
      size: this.state.countMax * 3 * 4 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      device.queue.writeBuffer(colorBuf, 0, colors());
    });

    const resolutions = new Float32Array(2);
    const resolutionBuf = device.createBuffer({
      label: 'resolution buffer',
      size: resolutions.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    effect(() => {
      resolutions.set([this.width(), this.height()]);
      device.queue.writeBuffer(resolutionBuf, 0, resolutions);
    });

    const bindGroup = device.createBindGroup({
      label: 'bind group',
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: scalingBuf,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: offsetBuf,
          },
        },
        {
          binding: 2,
          resource: {
            buffer: colorBuf,
          },
        },
        {
          binding: 3,
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
      pass.draw(3, this.state.count());
      pass.end();

      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
    };
  }
}

export default Renderer;
