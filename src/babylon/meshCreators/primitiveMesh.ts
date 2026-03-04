import {
  CreateBox,
  CreateSphere,
  CreateCylinder,
  CreateTorus,
  CreateCapsule,
  CreateDisc,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import { MeshShape } from '../../types/mesh';
import type { MeshMetadata } from '../../types/mesh';

export function createPrimitiveMesh(def: MeshMetadata, scene: Scene): Mesh {
  const { id, shape, color, dimensions, position } = def;
  let mesh: Mesh;

  switch (shape) {
    case MeshShape.Sphere:
      mesh = CreateSphere(id, { diameter: dimensions.diameter, segments: dimensions.segments }, scene);
      break;
    case MeshShape.Cylinder:
      mesh = CreateCylinder(id, { diameter: dimensions.diameter, height: dimensions.height, tessellation: dimensions.tessellation }, scene);
      break;
    case MeshShape.Torus:
      mesh = CreateTorus(id, { diameter: dimensions.diameter, thickness: dimensions.thickness, tessellation: dimensions.tessellation }, scene);
      break;
    case MeshShape.Capsule:
      mesh = CreateCapsule(id, { radius: dimensions.radius, height: dimensions.height, subdivisions: dimensions.subdivisions }, scene);
      break;
    case MeshShape.Cone:
      mesh = CreateCylinder(id, { diameterBottom: dimensions.diameterBottom, diameterTop: dimensions.diameterTop, height: dimensions.height, tessellation: dimensions.tessellation }, scene);
      break;
    case MeshShape.Disc:
      mesh = CreateDisc(id, { radius: dimensions.radius, tessellation: dimensions.tessellation }, scene);
      break;
    case MeshShape.Box:
    default:
      mesh = CreateBox(id, { width: dimensions.width, height: dimensions.height, depth: dimensions.depth }, scene);
      break;
  }

  mesh.position.set(position.x, position.y, position.z);

  const mat = new StandardMaterial(`${id}-mat`, scene);
  mat.diffuseColor = Color3.FromHexString(color);
  mat.specularColor = new Color3(0.3, 0.3, 0.3);
  mesh.material = mat;

  mesh.metadata = { meshId: id };
  return mesh;
}
