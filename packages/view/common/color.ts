import { random } from '@/common/math';

export type ColorLike =
  | string
  | { r: number; g: number; b: number; a?: number };

export class Color {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor(input: ColorLike) {
    // Handle object input
    if (typeof input === 'object') {
      this._r = input.r;
      this._g = input.g;
      this._b = input.b;
      this._a = input.a ?? 1;
      return;
    }

    // Parse hex format like #ff0000 or #ff000080
    const hexMatch = input.match(
      /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i,
    );
    if (hexMatch) {
      this._r = parseInt(hexMatch[1], 16);
      this._g = parseInt(hexMatch[2], 16);
      this._b = parseInt(hexMatch[3], 16);
      this._a = hexMatch[4] ? parseInt(hexMatch[4], 16) / 255 : 1;
      return;
    }

    // Parse rgb format like rgb(255, 0, 0)
    const rgbMatch = input.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (rgbMatch) {
      this._r = parseInt(rgbMatch[1]);
      this._g = parseInt(rgbMatch[2]);
      this._b = parseInt(rgbMatch[3]);
      this._a = 1;
      return;
    }

    // Parse rgba format like rgba(255, 0, 0, 0.5)
    const rgbaMatch = input.match(
      /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/i,
    );
    if (rgbaMatch) {
      this._r = parseInt(rgbaMatch[1]);
      this._g = parseInt(rgbaMatch[2]);
      this._b = parseInt(rgbaMatch[3]);
      this._a = parseFloat(rgbaMatch[4]);
      return;
    }

    throw new Error(`Invalid color format: ${input}`);
  }

  r() {
    return this._r;
  }

  g() {
    return this._g;
  }

  b() {
    return this._b;
  }

  a() {
    return this._a;
  }

  rgba(): ColorRGBA {
    return new ColorRGBA(this._r, this._g, this._b, this._a);
  }

  rgba8u(): ColorRGBA {
    return new ColorRGBA(this._r, this._g, this._b, Math.round(this._a * 255));
  }

  rgbanorm(): ColorRGBA {
    return new ColorRGBA(this._r / 255, this._g / 255, this._b / 255, this._a);
  }
}

export class ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  array(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }
}

export function kolor(
  colorStr: string | { r: number; g: number; b: number; a?: number },
): Color {
  return new Color(colorStr);
}

kolor.random = function (alpha?: boolean | number): Color {
  return new Color({
    r: Math.floor(random(0, 255)),
    g: Math.floor(random(0, 255)),
    b: Math.floor(random(0, 255)),
    a: typeof alpha === 'number' ? alpha : alpha ? random(0, 1) : 1,
  });
};
