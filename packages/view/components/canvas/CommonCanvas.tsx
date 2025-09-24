'use client';

import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

import { CommonRenderer } from '@/common/renderer';
import { CanvasResizeEvent, observeCanvasResize } from '@/common/resize';

export type ResizeCallback = (event: CanvasResizeEvent) => void;

export interface CommonCanvasProps<R extends typeof CommonRenderer> {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  Renderer: R;
  onResize?: ResizeCallback;
}

const CommonCanvas = <R extends typeof CommonRenderer>({
  Renderer,
  className = '',
  style = {},
  children,
  onResize,
}: CommonCanvasProps<R>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let observer: ResizeObserver;
    if (canvasRef.current && onResize) {
      observer = observeCanvasResize(canvasRef.current, (event) => {
        onResize(event);
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, [onResize]);

  useEffect(() => {
    let renderer: CommonRenderer;
    if (Renderer) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      renderer = new Renderer(canvasRef.current!);
      renderer.init();
    }

    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [Renderer]);

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
