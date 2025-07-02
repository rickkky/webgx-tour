import type { Pane } from 'tweakpane';

/**
 * Monitor and display FPS graph.
 * @param pane - Tweakpane instance.
 */
export function monitorFPS(pane: Pane): void {
  const state = { frameTime: 0, fps: 0 };

  const tab = pane.addTab({
    pages: [{ title: 'FPS' }, { title: 'Frame Time' }],
  });

  tab.pages[0].addBinding(state, 'fps', {
    label: 'fps',
    view: 'graph',
    readonly: true,
    interval: 128,
  });

  tab.pages[1].addBinding(state, 'frameTime', {
    label: 'frame time',
    view: 'graph',
    readonly: true,
    interval: 128,
  });

  let prev = performance.now();

  function update() {
    const now = performance.now();
    state.frameTime = now - prev;
    state.fps = Math.round(1000 / state.frameTime);
    prev = now;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
