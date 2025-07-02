import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { createProgram } from '@/common/webgl';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import initState from './state';

function initRender(props: WebGLInitRenderProps) {
  const { context, canvas, onResize } = props;

  const program = createProgram(context, vertexShader, fragmentShader);
  context.useProgram(program);

  const positionLoc = context.getAttribLocation(program, 'a_position');
  const positionBuf = context.createBuffer();

  const colorLoc = context.getAttribLocation(program, 'a_color');
  const colorBuf = context.createBuffer();

  const resolutionLoc = context.getUniformLocation(program, 'u_resolution');

  const state = initState(props);

  const resizeHandler = (width = canvas.width, height = canvas.height) => {
    context.viewport(0, 0, width, height);

    context.uniform2f(resolutionLoc, canvas.width, canvas.height);
  };

  resizeHandler();

  onResize(({ width, height }) => {
    resizeHandler(width, height);
  });

  const render = () => {
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    context.enableVertexAttribArray(positionLoc);
    context.bindBuffer(context.ARRAY_BUFFER, positionBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(state.positions),
      context.STATIC_DRAW,
    );
    // It implicitly binds the current `ARRAY_BUFFER` to the attribute.
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);

    context.enableVertexAttribArray(colorLoc);
    context.bindBuffer(context.ARRAY_BUFFER, colorBuf);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Uint8Array(state.colors),
      context.STATIC_DRAW,
    );
    context.vertexAttribPointer(colorLoc, 4, context.UNSIGNED_BYTE, true, 0, 0);

    context.drawArrays(context.TRIANGLES, 0, 3);
  };

  return render;
}

export default initRender;
