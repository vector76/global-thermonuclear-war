import { Coordinates, ProjectedCoordinates, ProjectionConfig } from '../../types';
import { BaseProjection } from './BaseProjection';

export class EquirectangularProjection extends BaseProjection {
  constructor(config: ProjectionConfig) {
    super(config);
  }

  project(coords: Coordinates): ProjectedCoordinates {
    // Normalize inputs
    const lon = this.normalizeLongitude(coords.longitude);
    const lat = this.clampLatitude(coords.latitude);

    // Simple equirectangular projection
    // x: longitude ranges from -180 to 180 -> 0 to width
    // y: latitude ranges from -90 to 90 -> height to 0 (SVG y is inverted)
    const x = (lon + 180) * (this.config.width / 360);
    const y = (90 - lat) * (this.config.height / 180);

    return { x, y };
  }

  unproject(point: ProjectedCoordinates): Coordinates {
    // Convert back from pixel coordinates to lat/lon
    const longitude = (point.x * 360 / this.config.width) - 180;
    const latitude = 90 - (point.y * 180 / this.config.height);

    return {
      longitude: this.normalizeLongitude(longitude),
      latitude: this.clampLatitude(latitude)
    };
  }
} 