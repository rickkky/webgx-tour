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
  onResize: (callback: (event: CanvasResizeEvent) => void) => void;
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

  const onResizeInner = useRef<(event: CanvasResizeEvent) => void>(null);
  const setOnResizeInner = (callback?: (event: CanvasResizeEvent) => void) => {
    onResizeInner.current = callback || null;
  };

  useEffect(
    () => {
      const canvas = canvasRef.current!;

      resizeCanvasToDisplaySize(canvas);

      const observer = observeCanvasResize(canvas, (event) => {
        onResizeInner.current?.(event);
        onResize?.(event);
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
          onResize: setOnResizeInner,
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
