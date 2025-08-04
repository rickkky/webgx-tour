import { Pane } from 'tweakpane';
import { signal } from '@/common/signal';
import { observeCanvasResize } from '@/common/resize';
import { monitorFrame } from '@/common/pane';
import { requestDevice } from '@/common/webgpu';
import { createDefer } from './defer';

export abstract class CommonRenderer {
  protected canvas: HTMLCanvasElement;

  private inited = false;

  protected pane: Pane | null = null;

  private resizeObserver: ResizeObserver | null = null;

  protected width = signal(0);
  protected height = signal(0);

  protected render: (() => void) | null = null;

  private frameId: number | null = null;

  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  init() {
    if (this.inited) {
      return;
    }
    this.inited = true;
    this.pane = new Pane({ title: 'Pane' });
    this.initPane();
    monitorFrame(this.pane!);
    Promise.all([this.initResize(), this.initContext()]).then(() => {
      if (this.disposed) {
        return;
      }
      this.render = this.initRender();
      this.startRenderLoop();
    });
  }

  private initResize() {
    const defer = createDefer();
    const fullfilled = false;
    this.resizeObserver = observeCanvasResize(this.canvas, (event) => {
      if (!fullfilled) {
        defer.resolve(event);
      }
      this.width(event.width);
      this.height(event.height);
    });
    return defer.promise;
  }

  protected abstract initContext(): Promise<void>;

  protected initPane(): void {}

  protected abstract initRender(): () => void;

  private startRenderLoop() {
    const loop = () => {
      if (!this.render) {
        this.frameId = null;
        return;
      }
      this.render();
      this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.resizeObserver?.disconnect();
    this.pane?.dispose();
  }
}

export abstract class WebGLRenderer extends CommonRenderer {
  protected context!: WebGL2RenderingContext;

  protected async initContext(): Promise<void> {
    const context = this.canvas.getContext('webgl2');
    if (!context) {
      throw new Error('WebGL2 is not supported.');
    }
    this.context = context;
  }
}

export abstract class WebGPURenderer extends CommonRenderer {
  protected context!: GPUCanvasContext;

  protected device!: GPUDevice;

  protected async initContext(): Promise<void> {
    const context = this.canvas.getContext('webgpu');
    if (!context) {
      throw new Error('WebGPU is not supported.');
    }
    this.context = context;
    this.device = await requestDevice();
  }
}
