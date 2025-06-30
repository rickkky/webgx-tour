'use client';

import React, { useCallback } from 'react';
import CommonCanvas, {
  CommonCanvasProps,
  InitRenderProps,
  InitRenderReturn,
} from './CommonCanvas';

export interface WebGLInitRenderProps extends InitRenderProps {
  context: WebGL2RenderingContext;
}

export interface WebGLCanvasProps
  extends Omit<CommonCanvasProps, 'initRender'> {
  initRender?: (props: WebGLInitRenderProps) => InitRenderReturn;
}

const WebGLCanvas: React.FC<WebGLCanvasProps> = ({ initRender, ...props }) => {
  const initRenderInner = useCallback(
    (initProps: InitRenderProps) => {
      if (!initRender) {
        return () => {};
      }

      const canvas = initProps.canvas;
      const context = canvas.getContext('webgl2');
      if (!context) {
        throw new Error('WebGL2 is not supported');
      }

      return initRender({ ...initProps, context });
    },
    [initRender],
  );

  return (
    <CommonCanvas
      initRender={initRender ? initRenderInner : undefined}
      {...props}
    />
  );
};

export default WebGLCanvas;
