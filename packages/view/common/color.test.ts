import { describe, test, expect } from 'vitest';
import { kolor } from './color';

describe('create Color instance', () => {
  test('hex', () => {
    const color = kolor('#800000').rgba();
    expect(color.r).toBe(128);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(1);
  });

  test('hex with alpha', () => {
    const color = kolor('#80000080').rgba();
    expect(color.r).toBe(128);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(128 / 255);
  });

  test('rgb', () => {
    const color = kolor('rgb(128, 0, 0)').rgba();
    expect(color.r).toBe(128);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(1);
  });

  test('rgba', () => {
    const color = kolor('rgba(128, 0, 0, 0.5)').rgba();
    expect(color.r).toBe(128);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(0.5);
  });

  test('rgb object', () => {
    const color = kolor({ r: 128, g: 0, b: 0 }).rgba();
    expect(color.r).toBe(128);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(1);
  });

  test('rgba object', () => {
    const color = kolor({ r: 128, g: 0, b: 0, a: 0.5 }).rgba();
    expect(color.r).toBe(128);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(0.5);
  });
});

describe('getter', () => {
  test('rgba', () => {
    const color = kolor('#80000080');
    expect(color.rgba()).toEqual({ r: 128, g: 0, b: 0, a: 128 / 255 });
  });

  test('rgba array', () => {
    const color = kolor('#80000080');
    expect(color.rgba().array()).toEqual([128, 0, 0, 128 / 255]);
  });

  test('rgba byte array', () => {
    const color = kolor('#80000080');
    expect(color.rgba8u().array()).toEqual([128, 0, 0, 128]);
  });

  test('rgba float array', () => {
    const color = kolor('#80000080');
    expect(color.rgbanorm().array()).toEqual([128 / 255, 0, 0, 128 / 255]);
  });
});

describe('static method', () => {
  test('kolor.random', () => {
    const color = kolor.random().rgba();
    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.r).toBeLessThanOrEqual(255);
    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeLessThanOrEqual(255);
    expect(color.b).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeLessThanOrEqual(255);
    expect(color.a).toBe(1);
  });

  test('kolor.random with alpha', () => {
    const color = kolor.random(true).rgba();
    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.r).toBeLessThanOrEqual(255);
    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeLessThanOrEqual(255);
    expect(color.b).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeLessThanOrEqual(255);
    expect(color.a).toBeGreaterThanOrEqual(0);
    expect(color.a).toBeLessThanOrEqual(1);
  });
});
