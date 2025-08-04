import { WebGLRenderer } from '@/common/renderer';
import { signal, computed, effect } from '@/common/signal';
import { random } from '@/common/math';
import { kolor } from '@/common/color';
import { bindSignal } from '@/common/pane';
import { createProgram } from '@/common/webgl';
import vertexSource from './vertex.glsl';
import fragmentSource from './fragment.glsl';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    -width * 1 / 10,  height * 1 / 10,
     width * 1 / 10,  height * 1 / 10,
     width * 0 / 10, -height * 1 / 10,
  ]
}

class Renderer extends WebGLRenderer {
  count = signal(10);

  positions = computed(
    () => new Float32Array(triangle(this.width(), this.height())),
  );

  scalings = computed(
    () =>
      new Float32Array(
        Array(this.count())
          .fill(0)
          .map(() => random(0.5, 2)),
      ),
  );
  offsets = computed(
    () =>
      new Float32Array(
        Array(this.count())
          .fill(0)
          .flatMap(() => [
            random(-(this.width() * 3) / 10, (this.width() * 3) / 10),
            random(-(this.height() * 3) / 10, (this.height() * 3) / 10),
          ]),
      ),
  );

  colorTextureInfo = computed(() => {
    const colorCount = this.count() * 3;
    const width = Math.ceil(Math.sqrt(colorCount));
    const height = Math.ceil(colorCount / width);
    const textureData = new Float32Array(width * height * 4);
    const colorData = Array(this.count() * 3)
      .fill(0)
      .flatMap(() => kolor.random(0.5).rgbanorm().array());

    textureData.set(colorData);

    // Fill extra texture data with 0 (padding).
    for (let i = colorData.length; i < textureData.length; i++) {
      textureData[i] = 0.0;
    }

    return { data: textureData, width, height };
  });

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });

    bindSignal(folder, this.count, {
      label: 'count',
      min: 1,
      max: 100,
      step: 1,
    });
  }

  initRender() {
    const context = this.context;

    const program = createProgram(context, vertexSource, fragmentSource);
    context.useProgram(program);

    const vao = context.createVertexArray();
    context.bindVertexArray(vao);

    const positionBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
      context.bufferData(
        context.ARRAY_BUFFER,
        this.positions(),
        context.STATIC_DRAW,
      );
    });
    const positionLoc = context.getAttribLocation(program, 'a_position');
    context.enableVertexAttribArray(positionLoc);
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    const scalingBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, scalingBuf);
      context.bufferData(
        context.ARRAY_BUFFER,
        this.scalings(),
        context.STATIC_DRAW,
      );
    });
    const scalingLoc = context.getAttribLocation(program, 'a_scaling');
    context.enableVertexAttribArray(scalingLoc);
    context.vertexAttribPointer(scalingLoc, 1, context.FLOAT, false, 0, 0);
    // Set the divisor to 1 so each instance uses one value.
    context.vertexAttribDivisor(scalingLoc, 1);

    const offsetBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, offsetBuf);
      context.bufferData(
        context.ARRAY_BUFFER,
        this.offsets(),
        context.STATIC_DRAW,
      );
    });
    const offsetLoc = context.getAttribLocation(program, 'a_offset');
    context.enableVertexAttribArray(offsetLoc);
    context.vertexAttribPointer(offsetLoc, 2, context.FLOAT, false, 0, 0);
    context.vertexAttribDivisor(offsetLoc, 1);

    context.bindVertexArray(null);

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
      const textureInfo = this.colorTextureInfo();
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
      context.viewport(0, 0, this.width(), this.height());

      context.uniform2f(resolutionLoc, this.width(), this.height());
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
      context.drawArraysInstanced(context.TRIANGLES, 0, 3, this.count());
    };
  }
}

export default Renderer;
