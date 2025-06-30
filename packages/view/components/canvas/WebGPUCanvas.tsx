'use client';

import React, { useCallback } from 'react';
import { requestDevice } from '@/common/webgpu';
import CommonCanvas, {
  CommonCanvasProps,
  InitRenderProps,
  InitRenderReturn,
} from './CommonCanvas';

export interface WebGPUInitRenderProps extends InitRenderProps {
  context: GPUCanvasContext;
  device: GPUDevice;
}

export interface WebGPUCanvasProps
  extends Omit<CommonCanvasProps, 'initRender'> {
  initRender?: (props: WebGPUInitRenderProps) => InitRenderReturn;
}

const WebGPUCanvas: React.FC<WebGPUCanvasProps> = ({
  initRender,
  ...props
}) => {
  const initRenderInner = useCallback(
    async (initProps: InitRenderProps) => {
      if (!initRender) {
        return () => {};
      }

      const canvas = initProps.canvas;
      const context = canvas.getContext('webgpu');
      if (!context) {
        throw new Error('WebGPU is not supported');
      }

      const device = await requestDevice();

      return initRender({ ...initProps, context, device });
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

export default WebGPUCanvas;
