export const MeshShape = {
  Box: 'Box',
  Sphere: 'Sphere',
  Cylinder: 'Cylinder',
  Torus: 'Torus',
  Capsule: 'Capsule',
  Cone: 'Cone',
  Plane: 'Plane',
  Disc: 'Disc',
} as const;

export type MeshShape = (typeof MeshShape)[keyof typeof MeshShape];

export interface MeshAnimation {
  rotationY?: number;  // rad/s
  rotationX?: number;  // rad/s
  rotationZ?: number;  // rad/s
  bobY?: number;       // amplitude (units)
  bobSpeed?: number;   // frequency (Hz)
}

export interface MeshMetadata {
  id: string;
  name: string;
  shape: MeshShape;
  color: string;
  dimensions: Record<string, number>;
  position: { x: number; y: number; z: number };
  animation?: MeshAnimation;
}
