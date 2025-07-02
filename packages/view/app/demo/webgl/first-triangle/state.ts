import { Pane } from 'tweakpane';
import { monitorFPS } from '@/common/pane';

function initState() {
  const pane = new Pane({ title: 'Pane' });

  const state = {
    color0: { r: 127, g: 0, b: 0, a: 0.5 },
    color1: { r: 0, g: 127, b: 0, a: 0.5 },
    color2: { r: 0, g: 0, b: 127, a: 0.5 },
  };

  const folder = pane.addFolder({
    title: 'State',
  });

  folder.addBinding(state, 'color0', {
    label: 'Color 0',
  });

  folder.addBinding(state, 'color1', {
    label: 'Color 1',
  });

  folder.addBinding(state, 'color2', {
    label: 'Color 2',
  });

  monitorFPS(pane);

  return state;
}

export default initState;
