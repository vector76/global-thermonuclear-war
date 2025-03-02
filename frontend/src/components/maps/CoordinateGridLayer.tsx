import React from 'react';
import { Coordinates, ProjectedCoordinates } from '../../types';

interface CoordinateGridLayerProps {
  projectCoordinates: (coords: Coordinates) => ProjectedCoordinates;
  width: number;
  height: number;
  visible: boolean;
}

const CoordinateGridLayer = ({ 
  projectCoordinates, 
  width, 
  height, 
  visible 
}: CoordinateGridLayerProps) => {
  if (!visible) return null;

  // Generate grid points every 10 degrees
  const gridPoints: Coordinates[] = [];
  
  // Generate points from -90 to 90 latitude, -180 to 180 longitude, every 10 degrees
  for (let lat = -90; lat <= 90; lat += 10) {
    for (let lon = -180; lon <= 180; lon += 10) {
      gridPoints.push({ latitude: lat, longitude: lon });
    }
  }

  // Filter function to remove any off-screen points (those that project to -1,-1)
  const filterValidPoints = (point: ProjectedCoordinates): boolean => {
    return point.x !== -1 && point.y !== -1;
  };

  return (
    <svg 
      className="coordinate-grid-layer" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',  // Allow clicks to pass through to map
        zIndex: 10
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {gridPoints.map((point, index) => {
        const projectedPoint = projectCoordinates(point);
        
        // Skip points that are off-screen
        if (!filterValidPoints(projectedPoint)) return null;
        
        return (
          <circle
            key={`grid-point-${index}`}
            cx={projectedPoint.x}
            cy={projectedPoint.y}
            r="0.75"
            fill="rgba(0, 255, 0, 0.6)"
            stroke="rgba(0, 255, 0, 0.8)"
            strokeWidth="0.25"
          />
        );
      })}
    </svg>
  );
};

export default CoordinateGridLayer; 