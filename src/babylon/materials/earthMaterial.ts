/**
 * Earth visual material — GLSL ShaderMaterial (day/night/clouds/bump/specular)
 * + StandardMaterial temperature overlay sphere (frozen ❄️ / hot 🔥)
 *
 * Temperature tinting deliberately uses a SEPARATE StandardMaterial sphere
 * rather than a shader uniform.  StandardMaterial property changes are applied
 * by Babylon.js natively on every frame — zero risk of shader-compilation
 * race conditions or silent uniform failures.
 */
import {
  ShaderMaterial,
  StandardMaterial,
  Texture,
  Vector3,
  CreateSphere,
  Color3,
  FresnelParameters,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { PlanetState } from '../../simulation/physics';

// ── GLSL Vertex shader ────────────────────────────────────────────────────────
const VERT = /* glsl */`
  precision highp float;

  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 worldViewProjection;
  uniform mat4 world;

  varying vec3 vNormal;
  varying vec2 vUV;
  varying vec3 vWorldPos;

  void main() {
    vNormal   = normalize(mat3(world) * normal);
    vUV       = uv;
    vWorldPos = vec3(world * vec4(position, 1.0));
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

// ── GLSL Fragment shader (no tempState — overlay handles temperature) ─────────
const FRAG = /* glsl */`
  precision highp float;

  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D cloudsTexture;
  uniform sampler2D normalTexture;
  uniform sampler2D specularTexture;

  uniform vec3  lightPosition;
  uniform float cloudUOffset;

  varying vec3 vNormal;
  varying vec2 vUV;
  varying vec3 vWorldPos;

  void main() {
    vec3 lightDir = normalize(lightPosition - vWorldPos);

    // Bump normal from normal map (simplified tangent-space approx)
    vec4  nSample     = texture2D(normalTexture, vUV);
    vec3  normalShift = (nSample.rgb * 2.0 - 1.0) * 0.28;
    vec3  bumpNormal  = normalize(vNormal + normalShift);

    float NdotL    = dot(bumpNormal, lightDir);
    float dayBlend = smoothstep(-0.12, 0.38, NdotL);

    vec4 dayColor    = texture2D(dayTexture,    vUV);
    vec4 nightColor  = texture2D(nightTexture,  vUV) * 0.70;
    vec4 cloudSample = texture2D(cloudsTexture, vec2(vUV.x + cloudUOffset, vUV.y));
    float specMask   = texture2D(specularTexture, vUV).r;

    // Day / night blend
    vec4 surface = mix(nightColor, dayColor, dayBlend);

    // Clouds on day side
    float cloudAlpha = cloudSample.r * 0.90 * dayBlend;
    surface = mix(surface, vec4(1.0, 1.0, 1.0, 1.0), cloudAlpha);

    // Ocean specular highlight (masked to water)
    float spec   = pow(max(NdotL, 0.0), 64.0) * specMask * 0.65;
    surface.rgb += vec3(spec * 0.38, spec * 0.52, spec * 1.0);

    gl_FragColor = vec4(surface.rgb, 1.0);
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface EarthMaterialApi {
  setTemperatureState: (state: PlanetState) => void;
}

export function applyEarthMaterial(
  mesh:        Mesh,
  scene:       Scene,
  sunWorldPos: Vector3,
  radius:      number,
): EarthMaterialApi {

  // ── ShaderMaterial (day/night/clouds/bump/specular) ───────────────────────
  const mat = new ShaderMaterial(
    'earth-shader',
    scene,
    { vertexSource: VERT, fragmentSource: FRAG },
    {
      attributes: ['position', 'normal', 'uv'],
      uniforms:   ['worldViewProjection', 'world', 'lightPosition', 'cloudUOffset'],
      samplers:   ['dayTexture', 'nightTexture', 'cloudsTexture', 'normalTexture', 'specularTexture'],
    },
  );

  const wrap = Texture.WRAP_ADDRESSMODE;
  const dayTex  = new Texture('/textures/earth_day.jpg',      scene);
  const nightTex= new Texture('/textures/earth_night.jpg',    scene);
  const cldTex  = new Texture('/textures/earth_clouds.jpg',   scene);
  const nrmTex  = new Texture('/textures/earth_normal.jpg',   scene);
  const spcTex  = new Texture('/textures/earth_specular.jpg', scene);
  for (const t of [dayTex, nightTex, cldTex, nrmTex, spcTex]) t.wrapU = t.wrapV = wrap;

  mat.setTexture('dayTexture',      dayTex);
  mat.setTexture('nightTexture',    nightTex);
  mat.setTexture('cloudsTexture',   cldTex);
  mat.setTexture('normalTexture',   nrmTex);
  mat.setTexture('specularTexture', spcTex);
  mat.setVector3('lightPosition',   sunWorldPos);
  mat.setFloat('cloudUOffset', 0);
  mat.backFaceCulling = true;
  mesh.material = mat;

  let cloudU = 0;
  scene.registerBeforeRender(() => {
    cloudU += 0.00018;
    mat.setFloat('cloudUOffset', cloudU);
  });

  // ── Atmosphere halo (fresnel rim glow) ────────────────────────────────────
  const atm = CreateSphere('earth-atm', { diameter: radius * 2 * 1.12, segments: 32 }, scene);
  atm.parent     = mesh;
  atm.isPickable = false;

  const atmMat = new StandardMaterial('earth-atm-mat', scene);
  atmMat.diffuseColor    = Color3.Black();
  atmMat.emissiveColor   = new Color3(0.20, 0.50, 1.0);
  atmMat.alpha           = 0.16;
  atmMat.backFaceCulling = false;
  atmMat.disableLighting = false;
  atmMat.emissiveFresnelParameters            = new FresnelParameters();
  atmMat.emissiveFresnelParameters.bias       = 0.30;
  atmMat.emissiveFresnelParameters.power      = 4;
  atmMat.emissiveFresnelParameters.leftColor  = new Color3(0.30, 0.62, 1.0);
  atmMat.emissiveFresnelParameters.rightColor = Color3.Black();
  atm.material = atmMat;

  // ── Temperature overlay sphere (StandardMaterial — always reliable) ───────
  // Sits just outside the Earth mesh.  Its emissiveColor + alpha change
  // instantly via StandardMaterial property assignment — no shader uniform needed.
  const tempOverlay = CreateSphere('earth-temp-overlay', {
    diameter: radius * 2 * 1.015,
    segments: 32,
  }, scene);
  tempOverlay.parent     = mesh;
  tempOverlay.isPickable = false;

  const overlayMat = new StandardMaterial('earth-temp-overlay-mat', scene);
  overlayMat.diffuseColor    = Color3.Black();
  overlayMat.emissiveColor   = Color3.Black();
  overlayMat.alpha           = 0;
  overlayMat.backFaceCulling = false;
  overlayMat.disableLighting = true;
  tempOverlay.material = overlayMat;

  // ── API ───────────────────────────────────────────────────────────────────
  return {
    setTemperatureState(state: PlanetState) {
      switch (state) {
        case 'frozen':
          overlayMat.emissiveColor = new Color3(0.50, 0.76, 1.0);
          overlayMat.alpha         = 0.54;
          break;
        case 'hot':
          overlayMat.emissiveColor = new Color3(1.0, 0.28, 0.04);
          overlayMat.alpha         = 0.50;
          break;
        default: // habitable — completely transparent
          overlayMat.emissiveColor = Color3.Black();
          overlayMat.alpha         = 0;
      }
    },
  };
}
