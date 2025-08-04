'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import CommonCanvas, { CommonCanvasProps } from './CommonCanvas';
import { CommonRenderer } from '@/common/renderer';

export type LayoutMode = 'fit' | 'square';

export interface LayoutCanvasProps<R extends typeof CommonRenderer>
  extends CommonCanvasProps<R> {
  mode?: LayoutMode;
  ratio?: number;
}

const LayoutCanvas = <R extends typeof CommonRenderer>({
  mode = 'square',
  ratio = 0.8,
  ...rest
}: LayoutCanvasProps<R>) => {
  const [ready, setReady] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const resizeHandler = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const outer = outerRef.current!;
      const inner = innerRef.current!;

      let outerWidth, outerHeight;

      if (entries) {
        outerWidth = entries[0].contentBoxSize[0].inlineSize;
        outerHeight = entries[0].contentBoxSize[0].blockSize;
      } else {
        outerWidth = outer.offsetWidth;
        outerHeight = outer.offsetHeight;
      }

      let innerWidth, innerHeight;

      if (mode === 'fit') {
        innerWidth = outerWidth * ratio;
        innerHeight = outerHeight * ratio;
      } else {
        const size = Math.min(outerWidth, outerHeight) * ratio;
        innerWidth = size;
        innerHeight = size;
      }

      inner.style.width = `${innerWidth}px`;
      inner.style.height = `${innerHeight}px`;

      if (!ready) {
        setReady(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () => {
      const observer = new ResizeObserver(resizeHandler);
      observer.observe(outerRef.current!);

      return () => {
        observer.disconnect();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div
      className='w-full h-full relative bg-gray-100'
      ref={outerRef}
    >
      <div
        ref={innerRef}
        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-md'
      >
        {ready ? <CommonCanvas {...rest}></CommonCanvas> : null}
      </div>
    </div>
  );
};

export default memo(LayoutCanvas);
