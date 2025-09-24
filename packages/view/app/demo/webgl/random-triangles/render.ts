import { kolor } from '@/common/color';
import { random } from '@/common/math';
import { bindSignal } from '@/common/pane';
import { WebGLRenderer } from '@/common/renderer';
import { computed, effect, signal } from '@/common/signal';
import { createProgram } from '@/common/webgl';

import fragmentSource from './fragment.glsl';
import vertexSource from './vertex.glsl';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    -width * 1 / 10,  height * 1 / 10,
     width * 1 / 10,  height * 1 / 10,
     width * 0 / 10, -height * 1 / 10,
  ]
}

class Renderer extends WebGLRenderer {
  state = {
    count: signal(10),
  };

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });
    bindSignal(folder, this.state.count, {
      label: 'count',
      min: 1,
      max: 100,
      step: 1,
    });
  }

  async initRender() {
    const context = this.context;

    const program = createProgram(context, vertexSource, fragmentSource);
    context.useProgram(program);

    const vao = context.createVertexArray();
    context.bindVertexArray(vao);

    const positions = computed(
      () => new Float32Array(triangle(this.width(), this.height())),
    );
    const positionBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
      context.bufferData(
        context.ARRAY_BUFFER,
        positions(),
        context.STATIC_DRAW,
      );
    });
    const positionLoc = context.getAttribLocation(program, 'a_position');
    context.enableVertexAttribArray(positionLoc);
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    const scalings = computed(
      () =>
        new Float32Array(
          Array(this.state.count())
            .fill(0)
            .map(() => random(0.5, 2)),
        ),
    );
    const scalingBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, scalingBuf);
      context.bufferData(context.ARRAY_BUFFER, scalings(), context.STATIC_DRAW);
    });
    const scalingLoc = context.getAttribLocation(program, 'a_scaling');
    context.enableVertexAttribArray(scalingLoc);
    context.vertexAttribPointer(scalingLoc, 1, context.FLOAT, false, 0, 0);
    // Set the divisor to 1 so each instance uses one value.
    context.vertexAttribDivisor(scalingLoc, 1);

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
    const offsetBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, offsetBuf);
      context.bufferData(context.ARRAY_BUFFER, offsets(), context.STATIC_DRAW);
    });
    const offsetLoc = context.getAttribLocation(program, 'a_offset');
    context.enableVertexAttribArray(offsetLoc);
    context.vertexAttribPointer(offsetLoc, 2, context.FLOAT, false, 0, 0);
    context.vertexAttribDivisor(offsetLoc, 1);

    context.bindVertexArray(null);

    const colorTextureInfo = computed(() => {
      const colorCount = this.state.count() * 3;
      const width = Math.ceil(Math.sqrt(colorCount));
      const height = Math.ceil(colorCount / width);
      const textureData = new Float32Array(width * height * 4);
      const colorData = Array(colorCount)
        .fill(0)
        .flatMap(() => kolor.random(0.5).rgbanorm().array());
      textureData.set(colorData);
      // Fill extra texture data with 0 (padding).
      for (let i = colorData.length; i < textureData.length; i++) {
        textureData[i] = 0.0;
      }
      return { data: textureData, width, height };
    });
    const colorTexture = context.createTexture();
    context.activeTexture(context.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, colorTexture);
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_S,
      context.CLAMP_TO_EDGE,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_T,
      context.CLAMP_TO_EDGE,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MIN_FILTER,
      context.NEAREST,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MAG_FILTER,
      context.NEAREST,
    );
    const colorTextureLoc = context.getUniformLocation(
      program,
      'u_color_texture',
    );
    effect(() => {
      const textureInfo = colorTextureInfo();
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA32F,
        textureInfo.width,
        textureInfo.height,
        0,
        context.RGBA,
        context.FLOAT,
        textureInfo.data,
      );
      context.uniform1i(colorTextureLoc, context.TEXTURE0);
    });

    const resolutionLoc = context.getUniformLocation(program, 'u_resolution');
    effect(() => {
      context.uniform2f(resolutionLoc, this.width(), this.height());
    });

    effect(() => {
      context.viewport(0, 0, this.width(), this.height());
    });

    context.enable(context.BLEND);
    context.blendFuncSeparate(
      context.SRC_ALPHA,
      context.ONE_MINUS_SRC_ALPHA,
      context.ONE,
      context.ONE_MINUS_SRC_ALPHA,
    );

    return () => {
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);

      context.bindVertexArray(vao);
      context.drawArraysInstanced(context.TRIANGLES, 0, 3, this.state.count());
    };
  }
}

export default Renderer;
