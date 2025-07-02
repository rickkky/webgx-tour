import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { createProgram } from '@/common/webgl';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import initState from './state';

function initRender(props: WebGLInitRenderProps) {
  const { context, canvas } = props;

  const program = createProgram(context, vertexShader, fragmentShader);

  const positionLoc = context.getAttribLocation(program, 'a_position');
  const positionBuf = context.createBuffer();

  const scalingLoc = context.getAttribLocation(program, 'a_scaling');
  const scalingBuf = context.createBuffer();

  const offsetLoc = context.getAttribLocation(program, 'a_offset');
  const offsetBuf = context.createBuffer();

  const colorLoc = context.getAttribLocation(program, 'a_color');
  const colorBuf = context.createBuffer();

  const resolutionLoc = context.getUniformLocation(program, 'u_resolution');

  const state = initState(props);

  const render = () => {
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    context.viewport(0, 0, canvas.width, canvas.height);

    context.useProgram(program);

    context.enableVertexAttribArray(positionLoc);
    context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(state.positions),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    context.enableVertexAttribArray(scalingLoc);
    context.bindBuffer(context.ARRAY_BUFFER, scalingBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(state.scalings),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(scalingLoc, 1, context.FLOAT, false, 0, 0);

    context.enableVertexAttribArray(offsetLoc);
    context.bindBuffer(context.ARRAY_BUFFER, offsetBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(state.offsets),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(offsetLoc, 2, context.FLOAT, false, 0, 0);

    context.enableVertexAttribArray(colorLoc);
    context.bindBuffer(context.ARRAY_BUFFER, colorBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Uint8Array(state.colors),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(colorLoc, 4, context.UNSIGNED_BYTE, true, 0, 0);

    context.uniform2f(resolutionLoc, canvas.width, canvas.height);

    context.drawArrays(context.TRIANGLES, 0, state.count * 3);
  };

  return render;
}

export default initRender;
