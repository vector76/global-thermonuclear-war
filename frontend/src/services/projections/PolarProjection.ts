import { Coordinates, ProjectedCoordinates, PolarProjectionConfig } from '../../types';
import { BaseProjection } from './BaseProjection';

export class PolarProjection extends BaseProjection {
  protected polarConfig: PolarProjectionConfig;

  constructor(config: PolarProjectionConfig) {
    super(config);
    this.polarConfig = config;
  }

  project(coords: Coordinates): ProjectedCoordinates {
    // Normalize inputs
    const lon = this.normalizeLongitude(coords.longitude - this.polarConfig.centerLon);
    const lat = this.clampLatitude(coords.latitude);

    // Don't project points below our minimum latitude
    if (lat < this.polarConfig.minLat) {
      return { x: -1, y: -1 }; // Off-screen point
    }

    // Convert to radians
    const lonRad = this.toRadians(lon);
    const latRad = this.toRadians(lat);

    // Calculate radius from center (90° at center, minLat at edge)
    const radius = (90 - lat) * (this.config.width / 2) / (90 - this.polarConfig.minLat);

    // Convert to cartesian coordinates
    const x = this.config.width / 2 + radius * Math.sin(lonRad);
    const y = this.config.height / 2 - radius * Math.cos(lonRad);

    return { x, y };
  }

  unproject(point: ProjectedCoordinates): Coordinates {
    // Convert to polar coordinates relative to center
    const dx = point.x - this.config.width / 2;
    const dy = this.config.height / 2 - point.y;

    // Calculate radius and angle
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dx, dy);

    // Convert back to lat/lon
    const lat = 90 - radius * (90 - this.polarConfig.minLat) / (this.config.width / 2);
    const lon = this.toDegrees(angle) + this.polarConfig.centerLon;

    return {
      longitude: this.normalizeLongitude(lon),
      latitude: this.clampLatitude(lat)
    };
  }
} 