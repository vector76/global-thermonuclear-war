export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ProjectedCoordinates {
  x: number;
  y: number;
}

export interface MissileTrajectory {
  id: string;
  points: Coordinates[];  // Sequence of lat/long pairs
  status: 'in-flight' | 'impacted';
  impactPoint?: Coordinates;  // Present when status is 'impacted'
}

export interface ProjectionConfig {
  width: number;
  height: number;
  scale: number;
}

export interface ConicProjectionConfig extends ProjectionConfig {
  standardParallel1: number;  // First standard parallel
  standardParallel2: number;  // Second standard parallel
  centerLat: number;          // Latitude of origin
  centerLon: number;          // Central meridian
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }
}

export interface PolarProjectionConfig extends ProjectionConfig {
  minLat: number;    // Minimum latitude to show (e.g., 50 for 50°N to 90°N)
  centerLon: number; // Central meridian
} 