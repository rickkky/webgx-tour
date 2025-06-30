import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { createProgram } from '@/common/webgl';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

// prettier-ignore
function triangle(width: number, height: number) {
  return [
    width / 10,     height * 9 / 10,
    width / 2,     height / 10,
    width * 9 / 10, height * 9 / 10,
  ]
}

function initRender({ context, canvas }: WebGLInitRenderProps) {
  const program = createProgram(context, vertexShader, fragmentShader);

  const positionLoc = context.getAttribLocation(program, 'a_position');
  const positionBuf = context.createBuffer();

  const colorLoc = context.getAttribLocation(program, 'a_color');
  const colorBuf = context.createBuffer();

  const resolutionLocation = context.getUniformLocation(
    program,
    'u_resolution',
  );

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
      new Float32Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(colorLoc, 4, context.UNSIGNED_BYTE, true, 0, 0);

    context.uniform2f(resolutionLocation, canvas.width, canvas.height);

    context.drawArrays(context.TRIANGLES, 0, 3);
  };

  return render;
}

export default initRender;
