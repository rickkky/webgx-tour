'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  CanvasResizeEvent,
  resizeCanvasToDisplaySize,
  observeCanvasResize,
} from '@/common/resize';

export type ResizeCallback = (event: CanvasResizeEvent) => void;

export interface InitRenderProps {
  canvas: HTMLCanvasElement;
  onResize: (callback: ResizeCallback, immediate?: boolean) => () => void;
}

export type InitRenderReturn = (() => void) | Promise<() => void>;

export interface CommonCanvasProps {
  initRender?: (props: InitRenderProps) => InitRenderReturn;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onResize?: ResizeCallback;
}

const CommonCanvas: React.FC<CommonCanvasProps> = ({
  initRender,
  className = '',
  style = {},
  children,
  onResize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeCbsRef = useRef<Set<ResizeCallback>>(new Set());
  const listenResize = (
    callback: (event: CanvasResizeEvent) => void,
    immediate = true,
  ) => {
    resizeCbsRef.current.add(callback);
    if (immediate) {
      const canvas = canvasRef.current!;
      callback({ canvas, width: canvas.width, height: canvas.height });
    }
    return () => {
      resizeCbsRef.current?.delete(callback);
    };
  };

  useEffect(
    () => {
      const canvas = canvasRef.current!;

      resizeCanvasToDisplaySize(canvas);

      const observer = observeCanvasResize(canvas, (event) => {
        onResize?.(event);
        resizeCbsRef.current.forEach((cb) => cb(event));
      });

      return () => {
        observer.disconnect();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const renderRef = useRef<() => void>(null);
  const frameRef = useRef<number>(0);

  const renderHandler = useCallback(() => {
    if (renderRef.current) {
      renderRef.current();
      frameRef.current = requestAnimationFrame(renderHandler);
    } else {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function init() {
      if (initRender) {
        const render = await initRender({
          canvas: canvasRef.current!,
          onResize: listenResize,
        });
        if (ignore) {
          return;
        }
        renderRef.current = render;
        frameRef.current = requestAnimationFrame(renderHandler);
      } else {
        renderRef.current = null;
      }
    }

    init();

    return () => {
      ignore = true;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [initRender, renderHandler]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx('bg-white', 'w-full', 'h-full', className)}
      style={style}
    >
      {children}
    </canvas>
  );
};

export default CommonCanvas;
