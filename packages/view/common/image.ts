'use client';

import { createDefer } from '@/common/defer';

export function loadImage(src: string) {
  const defer = createDefer<HTMLImageElement>();
  const img = new Image();
  img.onload = () => {
    defer.resolve(img);
  };
  img.onerror = (ev) => {
    defer.reject(ev);
  };
  img.src = src;
  return defer.promise;
}
