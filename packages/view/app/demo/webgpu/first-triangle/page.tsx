'use client';

import LayoutCanvas from '@/components/canvas/LayoutCanvas';
import Renderer from './render';

const Page = () => {
  return <LayoutCanvas Renderer={Renderer}></LayoutCanvas>;
};

export default Page;
