import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { createProgram } from '@/common/webgl';
import vertexSource from './vertex.glsl';
import fragmentSource from './fragment.glsl';
import initState from './state';

function initRender(props: WebGLInitRenderProps) {
  const { context, onResize } = props;

  const state = initState(props);

  const program = createProgram(context, vertexSource, fragmentSource);
  context.useProgram(program);

  const positionLoc = context.getAttribLocation(program, 'a_position');
  const positionBuf = context.createBuffer();
  state.$on('positions', () => {
    context.enableVertexAttribArray(positionLoc);
    context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      state.positions,
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);
  });

  const scalingLoc = context.getAttribLocation(program, 'a_scaling');
  const scalingBuf = context.createBuffer();
  state.$on('scalings', () => {
    context.enableVertexAttribArray(scalingLoc);
    context.bindBuffer(context.ARRAY_BUFFER, scalingBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      state.scalings,
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(scalingLoc, 1, context.FLOAT, false, 0, 0);
  });

  const offsetLoc = context.getAttribLocation(program, 'a_offset');
  const offsetBuf = context.createBuffer();
  state.$on('offsets', () => {
    context.enableVertexAttribArray(offsetLoc);
    context.bindBuffer(context.ARRAY_BUFFER, offsetBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      state.offsets,
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(offsetLoc, 2, context.FLOAT, false, 0, 0);
  });

  const colorLoc = context.getAttribLocation(program, 'a_color');
  const colorBuf = context.createBuffer();
  state.$on('colors', () => {
    context.enableVertexAttribArray(colorLoc);
    context.bindBuffer(context.ARRAY_BUFFER, colorBuf);
    context.bufferData(context.ARRAY_BUFFER, state.colors, context.STATIC_DRAW);
    context.vertexAttribPointer(colorLoc, 4, context.UNSIGNED_BYTE, true, 0, 0);
  });

  const resolutionLoc = context.getUniformLocation(program, 'u_resolution');

  onResize(({ width, height }) => {
    context.viewport(0, 0, width, height);

    context.uniform2f(resolutionLoc, width, height);
  });

  const render = () => {
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    context.drawArrays(context.TRIANGLES, 0, state.count * 3);
  };

  return render;
}

export default initRender;
