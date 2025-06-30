'use client';

import React, { useCallback, useEffect, useRef } from 'react';

export type LayoutMode = 'fit' | 'square';

export interface CanvasLayoutProps {
  mode?: LayoutMode;
  ratio?: number;
  children?: React.ReactNode;
}

const CanvasLayout: React.FC<CanvasLayoutProps> = ({
  mode = 'square',
  ratio = 0.8,
  children,
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const resizeHandler = useCallback(
    (entries?: ResizeObserverEntry[]) => {
      if (!outerRef.current || !innerRef.current) {
        return;
      }

      const outer = outerRef.current;
      const inner = innerRef.current;

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
    },
    [ratio, mode],
  );

  useEffect(() => {
    resizeHandler();

    const observer = new ResizeObserver(resizeHandler);
    observer.observe(outerRef.current!);

    return () => {
      observer.disconnect();
    };
  }, [resizeHandler]);

  return (
    <div
      className='w-full h-full relative bg-gray-100'
      ref={outerRef}
    >
      <div
        ref={innerRef}
        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-md'
      >
        {children}
      </div>
    </div>
  );
};

export default CanvasLayout;
