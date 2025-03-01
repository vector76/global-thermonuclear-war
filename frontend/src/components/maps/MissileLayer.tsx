import React from 'react';
import { Coordinates, MissileTrajectory, ProjectedCoordinates } from '../../types';

interface MissileLayerProps {
  trajectories: MissileTrajectory[];
  projectCoordinates: (coords: Coordinates) => ProjectedCoordinates;
  width: number;
  height: number;
}

const MissileLayer = ({ 
  trajectories, 
  projectCoordinates,
  width,
  height
}: MissileLayerProps) => {
  // Filter function to remove any off-screen points (those that project to -1,-1)
  const filterValidPoints = (points: ProjectedCoordinates[]): ProjectedCoordinates[] => {
    return points.filter(p => p.x !== -1 && p.y !== -1);
  };

  return (
    <svg 
      className="missile-layer" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0,
        width,
        height,
        pointerEvents: 'none'  // Allow clicks to pass through to map
      }}
    >
      {trajectories.map(trajectory => {
        // Project all points in the trajectory
        const projectedPoints = trajectory.points.map(projectCoordinates);
        const validPoints = filterValidPoints(projectedPoints);

        // Only render if we have valid points
        if (validPoints.length < 2) return null;

        // Create SVG path from projected points
        const pathData = validPoints
          .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
          .join(' ');

        return (
          <g key={trajectory.id}>
            {/* Render trajectory line */}
            <path
              d={pathData}
              stroke="rgba(255, 0, 0, 0.6)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Render impact point if missile has impacted */}
            {trajectory.status === 'impacted' && trajectory.impactPoint && (() => {
              const impact = projectCoordinates(trajectory.impactPoint);
              if (impact.x === -1 || impact.y === -1) return null;
              
              return (
                <>
                  {/* Outer glow */}
                  <circle
                    cx={impact.x}
                    cy={impact.y}
                    r="8"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="3"
                  />
                  {/* Inner circle */}
                  <circle
                    cx={impact.x}
                    cy={impact.y}
                    r="4"
                    fill="white"
                    stroke="rgba(255, 255, 255, 0.8)"
                    strokeWidth="2"
                  />
                </>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
};

export default MissileLayer; 