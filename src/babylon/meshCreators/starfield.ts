/**
 * Procedural starfield — a large sphere rendered from the inside.
 * Uses a GLSL hash function to scatter thousands of stars across UV space.
 * `infiniteDistance = true` keeps it pinned to the camera (true skybox behaviour).
 */
import { ShaderMaterial, CreateSphere } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

const VERT = /* glsl */`
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 worldViewProjection;
  varying vec2 vUV;
  void main() {
    vUV = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUV;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // Each "cell" may contain one star
    vec2 cell     = floor(vUV * 600.0);
    vec2 cellFrac = fract(vUV * 600.0) - 0.5;

    float r      = hash(cell);
    float isStar = step(0.963, r);          // ~3.7 % density

    float size = 0.035 + hash(cell + 13.7) * 0.10;
    float dist = length(cellFrac);
    float star = isStar * smoothstep(size, 0.0, dist);

    // Extra-bright "giant" stars (~0.4 % of cells)
    float bright = step(0.9958, r);
    star += bright * smoothstep(0.18, 0.0, dist) * 1.8;

    // Colour temperature: blue-white (hot) → warm yellow (cool)
    float warm  = hash(cell + 7.3);
    vec3  color = mix(vec3(0.62, 0.76, 1.00), vec3(1.00, 0.91, 0.68), warm * warm);

    gl_FragColor = vec4(color * star, 1.0);
  }
`;

export function createStarfield(scene: Scene): void {
  const sky = CreateSphere('starfield', { diameter: 900, segments: 16 }, scene);

  sky.isPickable      = true;          // keep false so raypick ignores it
  sky.isPickable      = false;
  sky.infiniteDistance = true;          // follows camera → true skybox

  const mat = new ShaderMaterial(
    'starfield-mat',
    scene,
    { vertexSource: VERT, fragmentSource: FRAG },
    { attributes: ['position', 'uv'], uniforms: ['worldViewProjection'] },
  );

  mat.backFaceCulling  = false;    // render inside of sphere
  mat.disableDepthWrite = true;    // stars never occlude geometry
  sky.material = mat;
}
