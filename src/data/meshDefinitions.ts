import { MeshShape } from '../types/mesh';
import type { MeshMetadata } from '../types/mesh';

export const MESH_DEFINITIONS: MeshMetadata[] = [
  {
    id: 'box-1',
    name: 'Box',
    shape: MeshShape.Box,
    color: '#4FC3F7',
    dimensions: { width: 1.2, height: 1.2, depth: 1.2 },
    position: { x: 0, y: 1, z: 0 },
  },
  {
    id: 'sphere-1',
    name: 'Sphere',
    shape: MeshShape.Sphere,
    color: '#81C784',
    dimensions: { diameter: 1.2, segments: 24 },
    position: { x: -3, y: 1, z: -2 },
  },
  {
    id: 'cylinder-1',
    name: 'Cylinder',
    shape: MeshShape.Cylinder,
    color: '#9575CD',
    dimensions: { diameter: 1.2, height: 1.8, tessellation: 24 },
    position: { x: 3, y: 1, z: -2 },
  },
  {
    id: 'torus-1',
    name: 'Torus',
    shape: MeshShape.Torus,
    color: '#F06292',
    dimensions: { diameter: 1.4, thickness: 0.4, tessellation: 32 },
    position: { x: 0, y: 1, z: -4 },
  },
  {
    id: 'capsule-1',
    name: 'Capsule',
    shape: MeshShape.Capsule,
    color: '#FFB74D',
    dimensions: { radius: 0.5, height: 2.0, subdivisions: 2 },
    position: { x: -3, y: 1.2, z: -5 },
  },
  {
    id: 'cone-1',
    name: 'Cone',
    shape: MeshShape.Cone,
    color: '#E57373',
    dimensions: { diameterBottom: 1.4, diameterTop: 0, height: 1.8, tessellation: 24 },
    position: { x: 3, y: 1, z: -5 },
  },
  {
    id: 'disc-1',
    name: 'Disc',
    shape: MeshShape.Disc,
    color: '#4DB6AC',
    dimensions: { radius: 0.8, tessellation: 32 },
    position: { x: 0, y: 0.05, z: -7 },
  },
];
