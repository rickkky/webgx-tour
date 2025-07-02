import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { createProgram } from '@/common/webgl';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import initState from './state';

// prettier-ignore
function triangles(count: number, width: number, height: number) {
  return [
    width * 4 / 10, height * 6 / 10,
    width * 6 / 10, height * 6/ 10,
    width * 5 / 10, height * 4 / 10,
  ]
}

function initRender({ context, canvas }: WebGLInitRenderProps) {
  const program = createProgram(context, vertexShader, fragmentShader);

  const positionLoc = context.getAttribLocation(program, 'a_position');
  const positionBuf = context.createBuffer();

  const colorLoc = context.getAttribLocation(program, 'a_color');
  const colorBuf = context.createBuffer();

  const resolutionLoc = context.getUniformLocation(program, 'u_resolution');

  const state = initState();

  const render = () => {
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    context.viewport(0, 0, canvas.width, canvas.height);

    context.useProgram(program);

    context.enableVertexAttribArray(positionLoc);
    context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(triangle(canvas.width, canvas.height)),
      context.STATIC_DRAW,
    );
    // It implicitly binds the current `ARRAY_BUFFER` to the attribute.
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    context.enableVertexAttribArray(colorLoc);
    context.bindBuffer(context.ARRAY_BUFFER, colorBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([
        state.color0.r,
        state.color0.g,
        state.color0.b,
        state.color0.a,
        state.color1.r,
        state.color1.g,
        state.color1.b,
        state.color1.a,
        state.color2.r,
        state.color2.g,
        state.color2.b,
        state.color2.a,
      ]),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(colorLoc, 4, context.FLOAT, false, 0, 0);

    context.uniform2f(resolutionLoc, canvas.width, canvas.height);

    context.drawArrays(context.TRIANGLES, 0, 3);
  };

  return render;
}

export default initRender;
