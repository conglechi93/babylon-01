/**
 * Sun visual material:
 *  – Animated emissive texture (churning plasma effect via UV drift)
 *  – Two-layer corona halo spheres (inner hot + outer diffuse)
 *  – Pulsing GlowLayer
 *  – setSpectralColor() to tint surface + halos for star type
 */
import {
  StandardMaterial,
  Texture,
  Color3,
  GlowLayer,
  CreateSphere,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';

export interface SunMaterialApi {
  /** Tint the sun surface + corona to the given hex colour (spectral class). */
  setSpectralColor: (hexColor: string) => void;
}

export function applySunMaterial(mesh: Mesh, scene: Scene, radius: number): SunMaterialApi {
  // ── Animated surface ───────────────────────────────────────────────────────
  const mat = new StandardMaterial('sun-mat', scene);

  const surfaceTex = new Texture('/textures/sun_surface.jpg', scene);
  surfaceTex.wrapU = Texture.WRAP_ADDRESSMODE;
  surfaceTex.wrapV = Texture.WRAP_ADDRESSMODE;

  mat.emissiveTexture = surfaceTex;
  mat.emissiveColor   = new Color3(1.0, 0.82, 0.28);
  mat.diffuseColor    = new Color3(0, 0, 0);
  mat.specularColor   = new Color3(0, 0, 0);
  mat.disableLighting = true;
  mesh.material = mat;

  scene.registerBeforeRender(() => {
    surfaceTex.uOffset += 0.00070;
    surfaceTex.vOffset += 0.00026;
  });

  // ── Inner corona halo ──────────────────────────────────────────────────────
  const halo = CreateSphere('sun-halo', { diameter: radius * 2 * 1.55, segments: 16 }, scene);
  halo.parent     = mesh;
  halo.isPickable = false;

  const haloMat = new StandardMaterial('sun-halo-mat', scene);
  haloMat.emissiveColor   = new Color3(1.0, 0.58, 0.10);
  haloMat.alpha           = 0.15;
  haloMat.backFaceCulling = false;
  haloMat.disableLighting = true;
  halo.material = haloMat;

  // ── Outer diffuse corona ───────────────────────────────────────────────────
  const outerHalo = CreateSphere('sun-outer-halo', { diameter: radius * 2 * 2.1, segments: 12 }, scene);
  outerHalo.parent     = mesh;
  outerHalo.isPickable = false;

  const outerMat = new StandardMaterial('sun-outer-halo-mat', scene);
  outerMat.emissiveColor   = new Color3(1.0, 0.38, 0.05);
  outerMat.alpha           = 0.06;
  outerMat.backFaceCulling = false;
  outerMat.disableLighting = true;
  outerHalo.material = outerMat;

  // ── Pulsing GlowLayer ──────────────────────────────────────────────────────
  const glow = new GlowLayer('sunGlow', scene, { mainTextureSamples: 4 });
  glow.addIncludedOnlyMesh(mesh);
  glow.addIncludedOnlyMesh(halo);

  let t = 0;
  scene.registerBeforeRender(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    t += delta;
    glow.intensity = 1.05 + Math.sin(t * 0.65) * 0.28;
  });

  // ── API ───────────────────────────────────────────────────────────────────
  return {
    setSpectralColor(hexColor: string) {
      const c = Color3.FromHexString(hexColor);
      // Surface emissive tint — keep luminance high, shift hue
      mat.emissiveColor = c;
      // Inner halo: slightly darkened version of the spectral colour
      haloMat.emissiveColor = c.scale(0.85);
      // Outer halo: even darker fade
      outerMat.emissiveColor = c.scale(0.55);
    },
  };
}
