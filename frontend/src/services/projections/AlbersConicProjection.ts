import { Coordinates, ProjectedCoordinates, ConicProjectionConfig } from '../../types';
import { BaseProjection } from './BaseProjection';

/**
 * Albers Equal-Area Conic Projection
 * This implementation matches the Python implementation used to generate the SVG maps
 */
export class AlbersConicProjection extends BaseProjection {
  protected conicConfig: ConicProjectionConfig;
  private n: number;        // Cone constant
  private C: number;        // Projection constant
  private rho0: number;     // Radius to origin point
  private customScaleFactor: number | null = null;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(config: ConicProjectionConfig) {
    super(config);
    this.conicConfig = config;
    
    // Pre-calculate constants used in projection
    const phi1 = this.toRadians(config.standardParallel1);
    const phi2 = this.toRadians(config.standardParallel2);
    const phi0 = this.toRadians(config.centerLat);
    
    // Calculate constants for the projection
    const sinPhi1 = Math.sin(phi1);
    const sinPhi2 = Math.sin(phi2);
    const cosPhi1 = Math.cos(phi1);
    
    // Calculate n (cone constant)
    this.n = (sinPhi1 + sinPhi2) / 2;
    
    // Calculate C (constant of the conic)
    this.C = cosPhi1 * cosPhi1 + 2 * this.n * sinPhi1;
    
    // Calculate rho0 (radius to origin)
    this.rho0 = Math.sqrt(this.C - 2 * this.n * Math.sin(phi0)) / this.n;
  }

  /**
   * Set custom scale factor and offsets for the projection
   * This allows matching the exact scaling and positioning used in the SVG map
   */
  setCustomScaleAndOffset(scaleFactor: number, offsetX: number, offsetY: number): void {
    this.customScaleFactor = scaleFactor;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
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

    // Calculate rho (radius)
    const rho = Math.sqrt(this.C - 2 * this.n * Math.sin(phi)) / this.n;
    
    // Calculate theta (angle)
    const theta = this.n * lambda;

    // Use custom scale factor if provided, otherwise calculate default
    const scaleFactor = this.customScaleFactor !== null 
      ? this.customScaleFactor 
      : Math.min(this.config.width, this.config.height) / (0.6 * this.rho0);

    // Calculate projected coordinates with scale factor and offsets
    const x = this.config.width / 2 + scaleFactor * rho * Math.sin(theta) + this.offsetX;
    const y = this.config.height / 2 + scaleFactor * (rho * Math.cos(theta) - this.rho0) + this.offsetY;

    return { x, y };
  }

  unproject(point: ProjectedCoordinates): Coordinates {
    // Use custom scale factor if provided, otherwise calculate default
    const scaleFactor = this.customScaleFactor !== null 
      ? this.customScaleFactor 
      : Math.min(this.config.width, this.config.height) / (0.6 * this.rho0);
    
    // Convert to polar coordinates relative to center point, accounting for offsets
    const dx = (point.x - this.config.width / 2 - this.offsetX) / scaleFactor;
    const dy = (point.y - this.config.height / 2 - this.offsetY) / scaleFactor + this.rho0;
    
    const rho = Math.sign(this.n) * Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dx, dy);

    // Convert back to lat/lon
    const lambda = theta / this.n;
    
    // Calculate phi (latitude in radians)
    const phi = Math.asin((this.C - (rho * this.n) * (rho * this.n)) / (2 * this.n));

    return {
      longitude: this.normalizeLongitude(this.toDegrees(lambda) + this.conicConfig.centerLon),
      latitude: this.clampLatitude(this.toDegrees(phi))
    };
  }
} 