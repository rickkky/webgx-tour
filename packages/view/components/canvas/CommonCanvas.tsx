'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  CanvasResizeEvent,
  resizeCanvasToDisplaySize,
  observeCanvasResize,
} from '@/common/resize';

export interface InitRenderProps {
  canvas: HTMLCanvasElement;
  onResize: (
    callback: (event: CanvasResizeEvent) => void,
    immediate?: boolean,
  ) => () => boolean;
}

export type InitRenderReturn = (() => void) | Promise<() => void>;

export interface CommonCanvasProps {
  initRender?: (props: InitRenderProps) => InitRenderReturn;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onResize?: (event: CanvasResizeEvent) => void;
}

const CommonCanvas: React.FC<CommonCanvasProps> = ({
  initRender,
  className = '',
  style = {},
  children,
  onResize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeCbsRef = useRef<((event: CanvasResizeEvent) => void)[]>([]);
  const listenResize = (
    callback: (event: CanvasResizeEvent) => void,
    immediate = true,
  ) => {
    resizeCbsRef.current.push(callback);
    if (immediate) {
      const canvas = canvasRef.current!;
      callback({ canvas, width: canvas.width, height: canvas.height });
    }
    return () => {
      const index = resizeCbsRef.current.indexOf(callback);
      if (index >= 0) {
        resizeCbsRef.current.splice(index, 1);
        return true;
      }
      return false;
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
