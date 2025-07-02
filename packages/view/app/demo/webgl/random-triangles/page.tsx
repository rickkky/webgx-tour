'use client';

import CanvasLayout from '@/components/canvas/CanvasLayout';
import WebGLCanvas from '@/components/canvas/WebGLCanvas';
import initRender from './render';

const RandomTrianglesPage = () => {
  return (
    <CanvasLayout>
      <WebGLCanvas initRender={initRender} />
    </CanvasLayout>
  );
};

export default RandomTrianglesPage;
