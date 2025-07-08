import { Pane } from 'tweakpane';
import type { WebGLInitRenderProps } from '@/components/canvas/WebGLCanvas';
import { proxyState } from '@/common/state';
import { kolor } from '@/common/color';
import { monitorFPS as monitorFrame } from '@/common/pane';

function triangle(width: number, height: number) {
  // prettier-ignore
  return [
    width * 1 / 10, height * 9 / 10,
    width * 9 / 10, height * 9 / 10,
    width * 5 / 10, height * 1 / 10,
  ]
}

export function initState({ onResize }: WebGLInitRenderProps) {
  const state = proxyState({
    positions: new Float32Array([]),
    color1: '#80000080',
    color2: '#00800080',
    color3: '#00008080',
    colors: new Uint8Array([]),
  });

  onResize(({ width, height }) => {
    state.positions = new Float32Array(triangle(width, height));
  });

  state.$on(['color1', 'color2', 'color3'], () => {
    state.colors = new Uint8Array([
      ...kolor(state.color1).rgba8u().array(),
      ...kolor(state.color2).rgba8u().array(),
      ...kolor(state.color3).rgba8u().array(),
    ]);
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

  monitorFrame(pane);

  return state;
}

export default initState;
