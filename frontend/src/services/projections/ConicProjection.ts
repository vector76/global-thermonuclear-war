import { Coordinates, ProjectedCoordinates, ConicProjectionConfig } from '../../types';
import { BaseProjection } from './BaseProjection';

export class ConicProjection extends BaseProjection {
  protected conicConfig: ConicProjectionConfig;
  private n: number;        // Cone constant
  private rho0: number;     // Radius to origin point
  private F: number;        // Projection constant

  constructor(config: ConicProjectionConfig) {
    super(config);
    this.conicConfig = config;
    
    // Pre-calculate constants used in projection
    const phi1 = this.toRadians(config.standardParallel1);
    const phi2 = this.toRadians(config.standardParallel2);
    const phi0 = this.toRadians(config.centerLat);
    
    const m1 = Math.cos(phi1) / Math.sqrt(1 - Math.sin(phi1) * Math.sin(phi1));
    const m2 = Math.cos(phi2) / Math.sqrt(1 - Math.sin(phi2) * Math.sin(phi2));
    
    this.n = Math.log(m1 / m2) / Math.log(Math.tan(Math.PI/4 + phi2/2) / Math.tan(Math.PI/4 + phi1/2));
    this.F = m1 / (this.n * Math.pow(Math.tan(Math.PI/4 + phi1/2), this.n));
    this.rho0 = this.F * Math.pow(Math.tan(Math.PI/4 + phi0/2), -this.n);
  }

  project(coords: Coordinates): ProjectedCoordinates {
    // Check if point is within bounds
    const { bounds } = this.conicConfig;
    if (coords.latitude < bounds.minLat || coords.latitude > bounds.maxLat ||
        coords.longitude < bounds.minLon || coords.longitude > bounds.maxLon) {
      return { x: -1, y: -1 }; // Off-screen point
    }

    // Convert to radians and normalize
    const phi = this.toRadians(this.clampLatitude(coords.latitude));
    const lambda = this.toRadians(this.normalizeLongitude(coords.longitude - this.conicConfig.centerLon));

    // Calculate polar coordinates
    const rho = this.F * Math.pow(Math.tan(Math.PI/4 + phi/2), -this.n);
    const theta = this.n * lambda;

    // Convert to cartesian coordinates
    const x = this.config.width/2 + rho * Math.sin(theta);
    const y = this.config.height/2 + this.rho0 - rho * Math.cos(theta);

    return { x, y };
  }

  unproject(point: ProjectedCoordinates): Coordinates {
    // Convert to polar coordinates relative to center point
    const dx = point.x - this.config.width/2;
    const dy = this.config.height/2 + this.rho0 - point.y;
    
    const rho = Math.sign(this.n) * Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dx, dy);

    // Convert back to lat/lon
    const lambda = theta / this.n;
    const phi = 2 * Math.atan(Math.pow(this.F/rho, 1/this.n)) - Math.PI/2;

    return {
      longitude: this.normalizeLongitude(this.toDegrees(lambda) + this.conicConfig.centerLon),
      latitude: this.clampLatitude(this.toDegrees(phi))
    };
  }
} 