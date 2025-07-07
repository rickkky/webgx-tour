'use client';

import CanvasLayout from '@/components/canvas/CanvasLayout';
import WebGPUCanvas from '@/components/canvas/WebGPUCanvas';
import initRender from './render';

const FirstTrianglePage = () => {
  return (
    <CanvasLayout>
      <WebGPUCanvas initRender={initRender} />
    </CanvasLayout>
  );
};

export default FirstTrianglePage;
