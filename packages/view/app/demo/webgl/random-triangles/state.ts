import { Pane } from 'tweakpane';
import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { proxyState } from '@/common/state';
import { random } from '@/common/math';
import { kolor } from '@/common/color';
import { monitorFPS } from '@/common/pane';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    width * 4 / 10, height * 6 / 10,
    width * 6 / 10, height * 6 / 10,
    width * 5 / 10, height * 4 / 10,
  ]
}

export function initState({ canvas, onResize }: WebGLInitRenderProps) {
  const state = proxyState({
    width: canvas.width,
    height: canvas.height,
    count: 10,
    positions: new Float32Array([]),
    scalings: new Float32Array([]),
    offsets: new Float32Array([]),
    colors: new Uint8Array([]),
  });

  onResize(({ width, height }) => {
    state.width = width;
    state.height = height;
  });

  state.$on(['width', 'height', 'count'], () => {
    state.positions = new Float32Array(
      Array(state.count)
        .fill(0)
        .flatMap(() => triangle(state.width, state.height)),
    );
  });

  state.$on('count', () => {
    state.scalings = new Float32Array(
      Array(state.count)
        .fill(0)
        .flatMap(() => Array(3).fill(random(0.5, 2))),
    );
    state.offsets = new Float32Array(
      Array(state.count)
        .fill(0)
        .flatMap(() => {
          return Array(3)
            .fill([
              random(-(canvas.width * 4) / 10, (canvas.width * 4) / 10),
              random(-(canvas.height * 4) / 10, (canvas.height * 4) / 10),
            ])
            .flat();
        }),
    );
    state.colors = new Uint8Array(
      Array(state.count * 3)
        .fill(0)
        .flatMap(() => kolor.random().rgba8u().array()),
    );
  });

  const pane = new Pane({ title: 'Pane' });

  const folder = pane.addFolder({
    title: 'State',
  });

  folder.addBinding(state, 'count', {
    label: 'count',
    min: 1,
    max: 100,
    step: 1,
  });

  monitorFPS(pane);

  return state;
}

export default initState;
