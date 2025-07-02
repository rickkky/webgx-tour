import { Pane } from 'tweakpane';
import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { kolor } from '@/common/color';
import { monitorFPS } from '@/common/pane';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    width * 1 / 10, height * 9 / 10,
    width * 9 / 10, height * 9 / 10,
    width * 5 / 10, height * 1 / 10,
  ]
}

export function initState({ onResize }: WebGLInitRenderProps) {
  const state = {
    positions: [] as number[],
    color1: { r: 127, g: 0, b: 0, a: 0.5 },
    color2: { r: 0, g: 127, b: 0, a: 0.5 },
    color3: { r: 0, g: 0, b: 127, a: 0.5 },
    colors: [] as number[],
  };

  onResize(({ width, height }) => {
    state.positions = triangle(width, height);
  });

  const pane = new Pane({ title: 'Pane' });

  const folder = pane.addFolder({
    title: 'State',
  });

  folder.addBinding(state, 'color1', {
    label: 'color 1',
  });
  folder.addBinding(state, 'color2', {
    label: 'color 2',
  });
  folder.addBinding(state, 'color3', {
    label: 'color 3',
  });

  const updateColors = () => {
    state.colors = [
      ...kolor(state.color1).rgbaByteArray(),
      ...kolor(state.color2).rgbaByteArray(),
      ...kolor(state.color3).rgbaByteArray(),
    ];
  };

  folder.on('change', updateColors);
  updateColors();

  monitorFPS(pane);

  return state;
}

export default initState;
