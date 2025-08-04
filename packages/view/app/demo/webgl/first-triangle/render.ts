import { WebGLRenderer } from '@/common/renderer';
import { signal, computed, effect } from '@/common/signal';
import { kolor } from '@/common/color';
import { bindSignal } from '@/common/pane';
import { createProgram } from '@/common/webgl';
import vertexSource from './vertex.glsl';
import fragmentSource from './fragment.glsl';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    width * 1 / 10, height * 9 / 10,
    width * 9 / 10, height * 9 / 10,
    width * 5 / 10, height * 1 / 10,
  ]
}

class Renderer extends WebGLRenderer {
  positions = computed(
    () => new Float32Array(triangle(this.width(), this.height())),
  );

  color1 = signal('#ff000080');
  color2 = signal('#00ff0080');
  color3 = signal('#0000ff80');
  colors = computed(
    () =>
      new Float32Array([
        ...kolor(this.color1()).rgbanorm().array(),
        ...kolor(this.color2()).rgbanorm().array(),
        ...kolor(this.color3()).rgbanorm().array(),
      ]),
  );

  initPane() {
    const folder = this.pane!.addFolder({
      title: 'State',
    });

    bindSignal(folder, this.color1, {
      label: 'color 1',
    });
    bindSignal(folder, this.color2, {
      label: 'color 2',
    });
    bindSignal(folder, this.color3, {
      label: 'color 3',
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
    // It implicitly binds the current `ARRAY_BUFFER` to the attribute.
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    const colorBuf = context.createBuffer();
    effect(() => {
      context.bindBuffer(context.ARRAY_BUFFER, colorBuf);
      context.bufferData(
        context.ARRAY_BUFFER,
        this.colors(),
        context.STATIC_DRAW,
      );
    });
    const colorLoc = context.getAttribLocation(program, 'a_color');
    context.enableVertexAttribArray(colorLoc);
    // It implicitly binds the current `ARRAY_BUFFER` to the attribute.
    context.vertexAttribPointer(colorLoc, 4, context.FLOAT, false, 0, 0);

    context.bindVertexArray(null);

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
      context.drawArrays(context.TRIANGLES, 0, 3);
    };
  }
}

export default Renderer;
