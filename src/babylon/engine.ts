import { Engine } from '@babylonjs/core';

export function createEngine(canvas: HTMLCanvasElement): Engine {
  return new Engine(canvas, true, { stencil: true });
}
