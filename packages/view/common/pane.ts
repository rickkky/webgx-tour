import type { Pane } from 'tweakpane';

/**
 * Monitor and display FPS graph.
 * @param pane - Tweakpane instance.
 */
export function monitorFPS(pane: Pane): void {
  const folder = pane.addFolder({
    title: 'FPS',
    expanded: true,
  });

  const state = { value: 0 };

  folder.addBinding(state, 'value', {
    label: 'FPS',
    view: 'graph',
    interval: 128,
    readonly: true,
  });

  let prev = performance.now();

  function update() {
    const now = performance.now();
    const delta = now - prev;
    state.value = Math.round(1000 / delta);
    prev = now;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
