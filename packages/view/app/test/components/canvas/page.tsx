'use client';

import { useState } from 'react';
import CanvasLayout from '@/components/canvas/CanvasLayout';
import CommonCanvas from '@/components/canvas/CommonCanvas';

export default function CanvasTestPage() {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  return (
    <div className='min-h-screen p-8 bg-gray-100'>
      <h1 className='text-2xl font-bold mb-8 text-center'>Canvas 组件示例</h1>

      <div className='space-y-12 max-w-6xl mx-auto'>
        <section>
          <h2 className='text-xl font-semibold mb-6'>CanvasLayout 组件</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-white p-4 rounded-lg shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>适应容器模式 (fit)</h3>
              <div className='h-64 border border-gray-200'>
                <CanvasLayout mode='fit' />
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>
                正方形模式 (square)
              </h3>
              <div className='h-64 border border-gray-200'>
                <CanvasLayout mode='square' />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-6'>CommonCanvas 组件</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-white p-4 rounded-lg shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>可调尺寸</h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>宽度</label>
                  <input
                    type='number'
                    min='0'
                    max='200'
                    defaultValue='100'
                    className='w-full p-2 border rounded'
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 200) {
                        setWidth(value);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>高度</label>
                  <input
                    type='number'
                    min='0'
                    max='200'
                    defaultValue='100'
                    className='w-full p-2 border rounded'
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 200) {
                        setHeight(value);
                      }
                    }}
                  />
                </div>
              </div>
              <div className='h-64 border border-gray-200 flex items-center justify-center'>
                <CommonCanvas
                  className='border border-gray-500'
                  style={{ width: `${width}px`, height: `${height}px` }}
                />
              </div>
            </div>

            <div className='bg-white p-4 rounded-lg shadow-md'>
              <h3 className='text-lg font-semibold mb-4'>自适应容器</h3>
              <div className='h-64 border border-gray-200'>
                <CommonCanvas className='border border-green-950' />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
