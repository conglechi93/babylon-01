import { Engine } from '@babylonjs/core/Engines/engine.js';

export function createEngine(canvas: HTMLCanvasElement): Engine {
  return new Engine(canvas, true, { stencil: true });
}
