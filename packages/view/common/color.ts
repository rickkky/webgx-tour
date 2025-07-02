import { random } from './math';

export type ColorLike =
  | string
  | { r: number; g: number; b: number; a?: number };

export class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(input: ColorLike) {
    // Handle object input
    if (typeof input === 'object') {
      this.r = input.r;
      this.g = input.g;
      this.b = input.b;
      this.a = input.a ?? 1;
      return;
    }

    // Parse hex format like #ff0000 or #ff000080
    const hexMatch = input.match(
      /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i,
    );
    if (hexMatch) {
      this.r = parseInt(hexMatch[1], 16);
      this.g = parseInt(hexMatch[2], 16);
      this.b = parseInt(hexMatch[3], 16);
      this.a = hexMatch[4] ? parseInt(hexMatch[4], 16) / 255 : 1;
      return;
    }

    // Parse rgb format like rgb(255, 0, 0)
    const rgbMatch = input.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (rgbMatch) {
      this.r = parseInt(rgbMatch[1]);
      this.g = parseInt(rgbMatch[2]);
      this.b = parseInt(rgbMatch[3]);
      this.a = 1;
      return;
    }

    // Parse rgba format like rgba(255, 0, 0, 0.5)
    const rgbaMatch = input.match(
      /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/i,
    );
    if (rgbaMatch) {
      this.r = parseInt(rgbaMatch[1]);
      this.g = parseInt(rgbaMatch[2]);
      this.b = parseInt(rgbaMatch[3]);
      this.a = parseFloat(rgbaMatch[4]);
      return;
    }

    throw new Error(`Invalid color format: ${input}`);
  }

  rgba(): { r: number; g: number; b: number; a: number } {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }

  rgbaArray(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }

  rgbaByteArray(): [number, number, number, number] {
    return [this.r, this.g, this.b, Math.round(this.a * 255)];
  }

  rgbaFloatArray(): [number, number, number, number] {
    return [this.r / 255, this.g / 255, this.b / 255, this.a];
  }
}

export function kolor(
  colorStr: string | { r: number; g: number; b: number; a?: number },
): Color {
  return new Color(colorStr);
}

kolor.random = function (alpha?: boolean): Color {
  return new Color({
    r: Math.floor(random(0, 255)),
    g: Math.floor(random(0, 255)),
    b: Math.floor(random(0, 255)),
    a: alpha ? random(0, 1) : 1,
  });
};
