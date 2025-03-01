export { BaseProjection } from './BaseProjection';
export { EquirectangularProjection } from './EquirectangularProjection';
export { PolarProjection } from './PolarProjection';
export { ConicProjection } from './ConicProjection';

export const PROJECTION_CONFIGS = {
  EQUIRECTANGULAR: {
    width: 360,
    height: 180,
    scale: 1
  },

  POLAR: {
    width: 400,
    height: 400,
    scale: 1,
    minLat: 50,  // Show from 50°N to 90°N
    centerLon: 0
  },

  CONTINENTAL_US: {
    width: 800,
    height: 500,
    scale: 1,
    standardParallel1: 33,
    standardParallel2: 45,
    centerLat: 39,
    centerLon: -98,
    bounds: {
      minLat: 25,
      maxLat: 50,
      minLon: -125,
      maxLon: -65
    }
  },

  RUSSIA: {
    width: 1000,
    height: 600,
    scale: 1,
    standardParallel1: 45,
    standardParallel2: 65,
    centerLat: 55,
    centerLon: 90,
    bounds: {
      minLat: 40,
      maxLat: 77,
      minLon: 20,
      maxLon: 180
    }
  }
} as const; 