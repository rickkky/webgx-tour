export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  multiplier = 1,
) {
  const width = Math.max(1, Math.floor(canvas.clientWidth * multiplier));
  const height = Math.max(1, Math.floor(canvas.clientHeight * multiplier));
  canvas.width = width;
  canvas.height = height;
}

export interface CanvasResizeEvent {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export function observeCanvasResize(
  canvas: HTMLCanvasElement,
  callback: (event: CanvasResizeEvent) => void,
  multiplier = 1,
) {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const size = entry.contentBoxSize[0];
    const width = Math.max(1, Math.floor(size.inlineSize * multiplier));
    const height = Math.max(1, Math.floor(size.blockSize * multiplier));
    canvas.width = width;
    canvas.height = height;
    callback({ canvas, width, height });
  });
  observer.observe(canvas);
  return observer;
}
