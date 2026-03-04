export const ServiceType = {
  Microservice: 'Microservice',
  Database: 'Database',
  MessageQueue: 'MessageQueue',
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export interface ServiceMetadata {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  technology: string;
  port: number;
  dependencies: string[];
  status: 'healthy' | 'degraded' | 'down';
}

export interface ServiceDefinition {
  metadata: ServiceMetadata;
  position: { x: number; y: number; z: number };
  color: string;
  dimensions?: { width?: number; height?: number; depth?: number; diameter?: number };
}
