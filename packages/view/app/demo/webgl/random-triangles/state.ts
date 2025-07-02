import { Pane } from 'tweakpane';
import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
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
  const state = {
    count: 10,
    positions: [] as number[],
    scalings: [] as number[],
    offsets: [] as number[],
    colors: [] as number[],
  };

  const updatePositions = (width: number, height: number) => {
    state.positions = Array(state.count)
      .fill(0)
      .flatMap(() => triangle(width, height));
  };

  onResize(({ width, height }) => {
    updatePositions(width, height);
  });

  const updateInput = () => {
    updatePositions(canvas.width, canvas.height);
    state.scalings = Array(state.count)
      .fill(0)
      .flatMap(() => Array(3).fill(random(0.5, 2)));
    state.offsets = Array(state.count)
      .fill(0)
      .flatMap(() => {
        return Array(3)
          .fill([
            random(-(canvas.width * 2) / 10, (canvas.width * 2) / 10),
            random(-(canvas.height * 2) / 10, (canvas.height * 2) / 10),
          ])
          .flat();
      });
    state.colors = Array(state.count * 3)
      .fill(0)
      .flatMap(() => kolor.random().rgbaByteArray());
  };

  updateInput();

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

  folder.on('change', () => {
    console.log(state);
    updateInput();
  });

  monitorFPS(pane);

  return state;
}

export default initState;
