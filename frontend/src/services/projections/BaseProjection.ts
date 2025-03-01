import { Coordinates, ProjectedCoordinates, ProjectionConfig } from '../../types';

export abstract class BaseProjection {
  protected config: ProjectionConfig;

  constructor(config: ProjectionConfig) {
    this.config = config;
  }

  abstract project(coords: Coordinates): ProjectedCoordinates;
  abstract unproject(point: ProjectedCoordinates): Coordinates;

  // Utility method to convert degrees to radians
  protected toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  // Utility method to convert radians to degrees
  protected toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  // Normalize longitude to [-180, 180]
  protected normalizeLongitude(lon: number): number {
    lon = lon % 360;
    return lon > 180 ? lon - 360 : (lon < -180 ? lon + 360 : lon);
  }

  // Clamp latitude to [-90, 90]
  protected clampLatitude(lat: number): number {
    return Math.max(-90, Math.min(90, lat));
  }
} 