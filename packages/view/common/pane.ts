import type { BindingParams, FolderApi, Pane } from 'tweakpane';

import { effect } from '@/common/signal';

export function bindSignal<T>(
  folder: FolderApi,
  signal: {
    (): T | undefined;
    (value: T | undefined): void;
  },
  options: BindingParams,
) {
  const data = { value: signal() };
  effect(() => {
    data.value = signal();
  });
  const binding = folder.addBinding(data, 'value', options);
  binding.on('change', (evt) => {
    signal(evt.value);
  });
  return binding;
}

export function monitorFrame(pane: Pane): void {
  const state = {
    ft: 0,
    fps: 0,
  };

  const folder = pane.addFolder({
    title: 'Frame',
  });

  const tab = folder.addTab({
    pages: [
      {
        title: 'FPS',
      },
      {
        title: 'FT',
      },
    ],
  });

  tab.pages[0].addBinding(state, 'fps', {
    label: 'fps',
    view: 'graph',
    readonly: true,
    min: 0,
    max: 200,
    interval: 128,
  });

  tab.pages[1].addBinding(state, 'ft', {
    label: 'ft',
    view: 'graph',
    readonly: true,
    min: 0,
    max: 1000,
    interval: 128,
  });

  let prev = performance.now();

  function update() {
    const now = performance.now();
    state.ft = now - prev;
    state.fps = Math.round(1000 / state.ft);
    prev = now;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
