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
  // Add debug mode state that can be toggled but default to false and don't expose UI for it
  const [isDebugMode] = React.useState<boolean>(false);
  
  // State to track current time for missile position calculation
  const [currentTime, setCurrentTime] = React.useState<number>(Date.now());
  
  // Update 4 times per second (250ms) for active missile positions
  React.useEffect(() => {
    // Update immediately on mount
    const now = Date.now();
    setCurrentTime(now);
    
    // Update 4 times per second (250ms) for active missile positions
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 250);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to determine missile status based on time
  const determineMissileStatus = (launchTime: number, impactTime: number, currentTime: number): 'PENDING' | 'ACTIVE' | 'IMPACT' | 'EXPIRED' => {
    // Define how long a missile stays in IMPACT state (60 minutes)
    const IMPACT_DURATION_MS = 60 * 60 * 1000;
    
    if (currentTime < launchTime) {
      return 'PENDING';
    } else if (currentTime >= launchTime && currentTime <= impactTime) {
      return 'ACTIVE';
    } else if (currentTime > impactTime && currentTime <= impactTime + IMPACT_DURATION_MS) {
      return 'IMPACT';
    } else {
      return 'EXPIRED';
    }
  };

  // Function to parse date string to timestamp, ensuring UTC interpretation
  const parseTimeToUTC = (timeStr: string | Date): number => {
    if (timeStr instanceof Date) {
      // For Date objects, get the timestamp directly
      const timestamp = timeStr.getTime();
      return timestamp;
    }
    
    // For string dates, parse to a new Date and get timestamp
    try {
      let date: Date;
      
      // Check if the string is in the format "YYYY-MM-DD HH:MM:SS" (from database)
      const dbFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (dbFormatRegex.test(timeStr)) {
        // Convert database format to ISO format with explicit UTC marker
        const [datePart, timePart] = timeStr.split(' ');
        const isoString = `${datePart}T${timePart}.000Z`;
        date = new Date(isoString);
      } else {
        // For other formats, use standard parsing
        date = new Date(timeStr);
      }
      
      const timestamp = date.getTime();
      return timestamp;
    } catch (error) {
      return 0; // Return a fallback value
    }
  };

  // Function to create intermediate points between launch and target
  // This uses geodesic great circle interpolation for more accurate paths
  const createIntermediatePoints = (start: Coordinates, end: Coordinates, count: number = 300): Coordinates[] => {
    const points: Coordinates[] = [];
    
    // Convert lat/lon to radians
    const startLatRad = toRadians(start.latitude);
    const startLonRad = toRadians(start.longitude);
    const endLatRad = toRadians(end.latitude);
    const endLonRad = toRadians(end.longitude);
    
    // Calculate the angular distance (central angle) between points
    const cosStartLat = Math.cos(startLatRad);
    const cosEndLat = Math.cos(endLatRad);
    const sinStartLat = Math.sin(startLatRad);
    const sinEndLat = Math.sin(endLatRad);
    
    // Handle longitude difference and normalize it
    let deltaLon = endLonRad - startLonRad;
    if (Math.abs(deltaLon) > Math.PI) {
      deltaLon = deltaLon > 0 ? -(2 * Math.PI - deltaLon) : (2 * Math.PI + deltaLon);
    }
    
    const cosDeltaLon = Math.cos(deltaLon);
    const sinDeltaLon = Math.sin(deltaLon);
    
    // Calculate the angular distance (central angle)
    const centralAngle = Math.acos(
      sinStartLat * sinEndLat + 
      cosStartLat * cosEndLat * cosDeltaLon
    );
    
    // If points are antipodal (nearly 180 degrees apart), adjust slightly
    const isAntipodal = Math.abs(centralAngle - Math.PI) < 1e-6;
    
    if (isAntipodal) {
      // For antipodal points, we'll use a different approach
      // by going through an intermediate point
      const midLat = (start.latitude + end.latitude) / 2;
      const midLon = (start.longitude + end.longitude + 
                     (Math.abs(start.longitude - end.longitude) > 180 ? 360 : 0)) / 2;
      
      // Recursively create points through the midpoint
      const firstHalf = createIntermediatePoints(
        start, 
        {latitude: midLat, longitude: midLon}, 
        Math.floor(count/2)
      );
      
      const secondHalf = createIntermediatePoints(
        {latitude: midLat, longitude: midLon},
        end,
        Math.floor(count/2)
      );
      
      // Combine the two halves (removing duplicate midpoint)
      return [...firstHalf, ...secondHalf.slice(1)];
    }
    
    // For non-antipodal points, use the standard formula
    for (let i = 0; i <= count; i++) {
      const fraction = i / count;
      
      // Use the spherical linear interpolation formula (SLERP)
      const sinFractionCentralAngle = Math.sin(fraction * centralAngle);
      const sinOneMinusFractionCentralAngle = Math.sin((1 - fraction) * centralAngle);
      const sinCentralAngle = Math.sin(centralAngle);
      
      // Calculate the interpolated point
      const a = sinOneMinusFractionCentralAngle / sinCentralAngle;
      const b = sinFractionCentralAngle / sinCentralAngle;
      
      const x = a * cosStartLat * Math.cos(startLonRad) + b * cosEndLat * Math.cos(endLonRad);
      const y = a * cosStartLat * Math.sin(startLonRad) + b * cosEndLat * Math.sin(endLonRad);
      const z = a * sinStartLat + b * sinEndLat;
      
      // Convert back to lat/lon
      const lat = toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)));
      const lon = toDegrees(Math.atan2(y, x));
      
      points.push({ latitude: lat, longitude: lon });
    }
    
    return points;
  };
  
  // Helper function to convert degrees to radians
  const toRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
  };
  
  // Helper function to convert radians to degrees
  const toDegrees = (radians: number): number => {
    return radians * 180 / Math.PI;
  };

  // Function to determine if a point is within the map bounds
  const isPointVisible = (point: ProjectedCoordinates): boolean => {
    return point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
  };

  // Function to determine if a point is valid (not -1,-1)
  const isPointValid = (point: ProjectedCoordinates): boolean => {
    return point.x !== -1 && point.y !== -1;
  };

  // Function to clip a point to the extended map boundaries
  // This allows rendering slightly outside the map for a smoother appearance
  const clipPoint = (point: ProjectedCoordinates, useLargeBounds: boolean = false): ProjectedCoordinates => {
    // If the point is invalid (-1,-1), return it as is
    if (!isPointValid(point)) {
      return point;
    }
    
    // Determine the margin based on whether we need large bounds
    // For points far outside the map, use a much larger margin
    const margin = useLargeBounds ? 10.0 : 0.1;
    
    // Calculate extended boundaries
    const minX = -width * margin;
    const maxX = width * (1 + margin);
    const minY = -height * margin;
    const maxY = height * (1 + margin);
    
    // Clip the point to the extended boundaries
    return {
      x: Math.max(minX, Math.min(maxX, point.x)),
      y: Math.max(minY, Math.min(maxY, point.y))
    };
  };

  // Process trajectory points to handle off-map segments
  const processTrajectoryPoints = (points: Coordinates[], isWorldMap: boolean = false): ProjectedCoordinates[] => {
    // Project all points
    const projectedPoints = points.map(projectCoordinates);
    
    // First pass: identify valid points and their indices
    const validPoints: {index: number, point: ProjectedCoordinates, originalCoords: Coordinates}[] = [];
    for (let i = 0; i < projectedPoints.length; i++) {
      if (isPointValid(projectedPoints[i])) {
        validPoints.push({
          index: i, 
          point: projectedPoints[i],
          originalCoords: points[i]
        });
      }
    }
    
    // If we have no valid points, we can't render anything
    if (validPoints.length === 0) {
      return [];
    }
    
    // For world maps, check for date line crossings and split into multiple segments
    if (isWorldMap) {
      const segments: {start: number, end: number}[] = [];
      let currentSegmentStart = 0;
      
      // Check each pair of consecutive valid points for date line crossing
      for (let i = 1; i < validPoints.length; i++) {
        const prevPoint = validPoints[i-1];
        const currentPoint = validPoints[i];
        
        // Check if this segment crosses the date line (longitude ±180°)
        const prevLon = prevPoint.originalCoords.longitude;
        const currentLon = currentPoint.originalCoords.longitude;
        
        // If longitude difference is greater than 180°, it's likely crossing the date line
        if (Math.abs(currentLon - prevLon) > 180) {
          // End the current segment
          segments.push({
            start: currentSegmentStart,
            end: i - 1
          });
          
          // Start a new segment
          currentSegmentStart = i;
        }
      }
      
      // Add the final segment
      if (currentSegmentStart < validPoints.length - 1) {
        segments.push({
          start: currentSegmentStart,
          end: validPoints.length - 1
        });
      } else if (validPoints.length === 1) {
        // Handle the case with only one valid point
        segments.push({
          start: 0,
          end: 0
        });
      }
      
      // Process each segment separately
      const processedPoints: ProjectedCoordinates[] = [];
      
      for (let segIdx = 0; segIdx < segments.length; segIdx++) {
        const segment = segments[segIdx];
        
        // If this isn't the first segment, add a break point
        if (segIdx > 0) {
          processedPoints.push({ x: -999, y: -999 });
        }
        
        // Process this segment
        const segmentValidPoints = validPoints.slice(segment.start, segment.end + 1);
        
        // Create sub-segments between consecutive points in this segment
        const subSegments: {start: number, end: number}[] = [];
        for (let i = 1; i < segmentValidPoints.length; i++) {
          subSegments.push({
            start: segmentValidPoints[i-1].index,
            end: segmentValidPoints[i].index
          });
        }
        
        // Process each sub-segment
        processSubSegments(subSegments, validPoints, projectedPoints, processedPoints);
      }
      
      return processedPoints;
    } else {
      // For non-world maps, process normally
      // Create segments between valid points
      const segments: {start: number, end: number}[] = [];
      for (let i = 1; i < validPoints.length; i++) {
        segments.push({
          start: validPoints[i-1].index,
          end: validPoints[i].index
        });
      }
      
      // Process each segment to create a smooth path
      const processedPoints: ProjectedCoordinates[] = [];
      processSubSegments(segments, validPoints, projectedPoints, processedPoints);
      
      return processedPoints;
    }
  };
  
  // Helper function to process sub-segments
  const processSubSegments = (
    segments: {start: number, end: number}[],
    validPoints: {index: number, point: ProjectedCoordinates, originalCoords: Coordinates}[],
    projectedPoints: ProjectedCoordinates[],
    processedPoints: ProjectedCoordinates[]
  ): void => {
    // Handle the case where the first point is invalid
    if (validPoints[0].index > 0) {
      // Extrapolate backwards from the first valid point
      const firstValid = validPoints[0];
      const nextValid = validPoints.length > 1 ? validPoints[1] : null;
      
      if (nextValid) {
        // Calculate direction vector from first valid to next valid
        const dx = nextValid.point.x - firstValid.point.x;
        const dy = nextValid.point.y - firstValid.point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction vector
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Extrapolate backwards
        const backDistance = distance * (firstValid.index / (nextValid.index - firstValid.index));
        const backPoint = {
          x: firstValid.point.x - dirX * backDistance,
          y: firstValid.point.y - dirY * backDistance
        };
        
        // Add the extrapolated point
        processedPoints.push(clipPoint(backPoint, true));
      } else {
        // Just extend in the opposite direction of the map center
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = firstValid.point.x - centerX;
        const dy = firstValid.point.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and extend
        const dirX = distance > 0 ? dx / distance : (firstValid.point.x < centerX ? -1 : 1);
        const dirY = distance > 0 ? dy / distance : (firstValid.point.y < centerY ? -1 : 1);
        
        const backPoint = {
          x: firstValid.point.x + dirX * width * 0.2,
          y: firstValid.point.y + dirY * height * 0.2
        };
        
        // Add the extrapolated point
        processedPoints.push(clipPoint(backPoint, true));
      }
    }
    
    // Process each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const startPointInfo = validPoints.find(vp => vp.index === segment.start)!;
      const endPointInfo = validPoints.find(vp => vp.index === segment.end)!;
      const startPoint = startPointInfo.point;
      const endPoint = endPointInfo.point;
      
      // Add the start point
      if (i === 0 || processedPoints.length === 0) {
        processedPoints.push(clipPoint(startPoint, false));
      }
      
      // If there are points between start and end, interpolate them
      if (segment.end - segment.start > 1) {
        const segmentLength = segment.end - segment.start;
        
        for (let j = 1; j < segmentLength; j++) {
          const fraction = j / segmentLength;
          const interpolatedPoint = {
            x: startPoint.x + fraction * (endPoint.x - startPoint.x),
            y: startPoint.y + fraction * (endPoint.y - startPoint.y)
          };
          
          processedPoints.push(clipPoint(interpolatedPoint, false));
        }
      }
      
      // Add the end point
      processedPoints.push(clipPoint(endPoint, false));
    }
    
    // Handle the case where the last point is invalid
    const lastValidPoint = validPoints[validPoints.length - 1];
    if (lastValidPoint.index < projectedPoints.length - 1) {
      // Extrapolate forwards from the last valid point
      const prevValid = validPoints.length > 1 ? validPoints[validPoints.length - 2] : null;
      
      if (prevValid) {
        // Calculate direction vector from previous valid to last valid
        const dx = lastValidPoint.point.x - prevValid.point.x;
        const dy = lastValidPoint.point.y - prevValid.point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction vector
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Extrapolate forwards
        const forwardDistance = distance * ((projectedPoints.length - 1 - lastValidPoint.index) / (lastValidPoint.index - prevValid.index));
        const forwardPoint = {
          x: lastValidPoint.point.x + dirX * forwardDistance,
          y: lastValidPoint.point.y + dirY * forwardDistance
        };
        
        // Add the extrapolated point
        processedPoints.push(clipPoint(forwardPoint, true));
      } else {
        // Just extend in the direction away from the map center
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = lastValidPoint.point.x - centerX;
        const dy = lastValidPoint.point.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and extend
        const dirX = distance > 0 ? dx / distance : (lastValidPoint.point.x < centerX ? -1 : 1);
        const dirY = distance > 0 ? dy / distance : (lastValidPoint.point.y < centerY ? -1 : 1);
        
        const forwardPoint = {
          x: lastValidPoint.point.x + dirX * width * 0.2,
          y: lastValidPoint.point.y + dirY * height * 0.2
        };
        
        // Add the extrapolated point
        processedPoints.push(clipPoint(forwardPoint, true));
      }
    }
  };

  // Function to calculate the current position of a missile based on time
  const calculateCurrentMissilePosition = (
    trajectory: MissileTrajectory, 
    allPoints: Coordinates[]
  ): Coordinates | null => {
    // Get launch and impact times - ensure we're using UTC consistently
    let launchTime: number;
    let impactTime: number;
    
    try {
      // Parse times ensuring UTC interpretation
      launchTime = parseTimeToUTC(trajectory.launchTime);
      impactTime = parseTimeToUTC(trajectory.impactTime);
      
      // Determine status based on current time
      const timeBasedStatus = determineMissileStatus(launchTime, impactTime, currentTime);
      
      // Only calculate position for ACTIVE missiles
      if (timeBasedStatus !== 'ACTIVE') {
        return null;
      }
      
      // If times are invalid or impact time is before launch time, return null
      if (isNaN(launchTime) || isNaN(impactTime) || impactTime <= launchTime) {
        return null;
      }
      
      // Calculate progress as a fraction between 0 and 1
      const totalFlightTime = impactTime - launchTime;
      const elapsedTime = currentTime - launchTime;
      let progress = elapsedTime / totalFlightTime;
      
      // Clamp progress between 0 and 1
      progress = Math.max(0, Math.min(1, progress));
      
      // Find the index in the points array
      const pointIndex = Math.floor(progress * (allPoints.length - 1));
      
      // For more precise positioning, interpolate between the two nearest points
      if (pointIndex < allPoints.length - 1) {
        const pointFraction = progress * (allPoints.length - 1) - pointIndex;
        const point1 = allPoints[pointIndex];
        const point2 = allPoints[pointIndex + 1];
        
        return {
          latitude: point1.latitude + pointFraction * (point2.latitude - point1.latitude),
          longitude: point1.longitude + pointFraction * (point2.longitude - point1.longitude)
        };
      }
      
      // Fallback to exact point
      return allPoints[pointIndex];
    } catch (error) {
      return null;
    }
  };

  // Determine which map we're currently viewing
  const determineMapType = (): 'world' | 'us' | 'russia' => {
    // Check if this is a regional map by testing points at the edges
    const usWestCoast = projectCoordinates({latitude: 37, longitude: -122}); // San Francisco
    const usEastCoast = projectCoordinates({latitude: 40, longitude: -74});  // New York
    
    const russiaWest = projectCoordinates({latitude: 55, longitude: 37});    // Moscow
    const russiaEast = projectCoordinates({latitude: 43, longitude: 132});   // Vladivostok
    
    // Calculate distances between these points
    const usCoastDistance = Math.sqrt(
      Math.pow(usEastCoast.x - usWestCoast.x, 2) + 
      Math.pow(usEastCoast.y - usWestCoast.y, 2)
    );
    
    const russiaDistance = Math.sqrt(
      Math.pow(russiaEast.x - russiaWest.x, 2) + 
      Math.pow(russiaEast.y - russiaWest.y, 2)
    );
    
    // Check if US map (US coast distance is large)
    if (usCoastDistance > width * 0.5) {
      return 'us';
    }
    
    // Check if Russia map (Russia distance is large)
    if (russiaDistance > width * 0.5) {
      return 'russia';
    }
    
    // Default to world map
    return 'world';
  };
  
  // Get the current map type
  const currentMapType = determineMapType();
  
  // Define predefined sizes for each map type
  const mapSizes = {
    world: {
      baseLineWidth: 1,
      baseImpactRadius: 2,
      launchPointRadius: 4
    },
    us: {
      baseLineWidth: 3,
      baseImpactRadius: 12,
      launchPointRadius: 12
    },
    russia: {
      baseLineWidth: 3,
      baseImpactRadius: 10,
      launchPointRadius: 10
    }
  };
  
  // Get the sizes for the current map
  const { baseLineWidth, baseImpactRadius, launchPointRadius } = mapSizes[currentMapType];
  
  // Actual sizes to use in rendering - these will be modified per missile status
  let impactRadius = baseImpactRadius;

  return (
    <>
      <svg 
        className="missile-layer" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',  // Allow clicks to pass through to map
          zIndex: 20,
          overflow: 'visible'  // Allow rendering outside the SVG boundaries
        }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Debug information */}
        {isDebugMode && (
          <g>
            <text x="10" y="20" fontSize="12" fill="white" stroke="black" strokeWidth="0.5" paintOrder="stroke">
              Map Type: {currentMapType}
            </text>
            <text x="10" y="40" fontSize="12" fill="white" stroke="black" strokeWidth="0.5" paintOrder="stroke">
              Base Line Width: {baseLineWidth}px
            </text>
            <text x="10" y="60" fontSize="12" fill="white" stroke="black" strokeWidth="0.5" paintOrder="stroke">
              Impact Radius: {baseImpactRadius}px
            </text>
          </g>
        )}
        {trajectories.map(trajectory => {
          // Parse launch and impact times
          let launchTime: number;
          let impactTime: number;
          
          try {
            launchTime = parseTimeToUTC(trajectory.launchTime);
            impactTime = parseTimeToUTC(trajectory.impactTime);
          } catch (error) {
            return null;
          }
          
          // Determine status based on time
          const timeBasedStatus = determineMissileStatus(launchTime, impactTime, currentTime);
          
          // Create intermediate points for better curved projection
          const allPoints = createIntermediatePoints(
            trajectory.launchPoint, 
            trajectory.targetPoint
          );
          
          // Determine if this is a world map based on dimensions
          // World maps typically have a 2:1 aspect ratio and width around 360
          // US map has width 720 and height 360, so it also has a 2:1 ratio but is larger
          const isWorldMap = Math.abs(width / height - 2) < 0.5;
          
          // For debugging: Project all points directly without extrapolation
          const rawProjectedPoints = allPoints.map(projectCoordinates);
          
          // Process points to handle off-map segments
          const processedPoints = processTrajectoryPoints(allPoints, isWorldMap);
          
          // Skip if we don't have enough points to draw a line
          if (processedPoints.length < 2) {
            return null;
          }

          // Determine line color based on missile status
          let lineColor = 'rgba(200, 200, 200, 0.6)'; // Default light gray for ACTIVE
          let lineDash = ''; // No dash by default
          let lineWidth = baseLineWidth; // Start with the base line width
          
          switch (timeBasedStatus) {
            case 'PENDING':
              lineColor = 'rgba(0, 0, 255, 0.4)'; // Blue for pending
              lineWidth = baseLineWidth * 0.5; // Thinner line for pending
              break;
            case 'ACTIVE':
              lineColor = 'rgba(200, 200, 200, 0.6)'; // Light gray for active
              lineWidth = baseLineWidth; // Normal width for active
              lineDash = '5,5'; // Dashed line for active
              break;
            case 'IMPACT':
              lineColor = 'rgba(255, 255, 255, 0.8)'; // White for impact
              lineWidth = baseLineWidth; // Normal width for impact
              break;
            case 'EXPIRED':
              lineColor = 'rgba(128, 128, 128, 0.3)'; // More transparent gray for expired
              lineWidth = baseLineWidth * 0.5; // Thinner line for expired
              break;
          }

          // Create path data from processed points, handling path breaks
          const pathData = processedPoints
            .map((point, i) => {
              // If this is a break point (-999, -999), start a new subpath with "M"
              if (point.x === -999 && point.y === -999) {
                return i < processedPoints.length - 1 ? `M ${processedPoints[i + 1].x},${processedPoints[i + 1].y}` : '';
              }
              
              // For the first point or after a break, use "M" to start a new path
              if (i === 0 || (i > 0 && processedPoints[i-1].x === -999 && processedPoints[i-1].y === -999)) {
                return `M ${point.x},${point.y}`;
              }
              
              // For all other points, use a smooth curve
              // We'll use a simple line segment for now, but could use Bezier curves for more smoothness
              return `L ${point.x},${point.y}`;
            })
            .filter(cmd => cmd !== '') // Remove any empty commands
            .join(' ');

          // Project launch and target points for markers
          const projectedLaunch = projectCoordinates(trajectory.launchPoint);
          const projectedTarget = projectCoordinates(trajectory.targetPoint);
          
          // Clip the launch and target points to extended boundaries if they're valid
          const clippedLaunch = isPointValid(projectedLaunch) ? clipPoint(projectedLaunch) : projectedLaunch;
          const clippedTarget = isPointValid(projectedTarget) ? clipPoint(projectedTarget) : projectedTarget;

          // Calculate current missile position
          const missilePosition = calculateCurrentMissilePosition(trajectory, allPoints);
          
          // Only render missile position marker if we have a valid position
          let missileMarker = null;
          if (missilePosition && timeBasedStatus !== 'ACTIVE') { // Don't create marker for ACTIVE missiles
            const projectedMissile = projectCoordinates(missilePosition);
            
            // Only render if the missile is within the visible map area
            if (isPointVisible(projectedMissile)) {
              // Render a smaller, more transparent marker in debug mode
              const markerSize = isDebugMode ? 4 : 8;
              const markerOpacity = isDebugMode ? 0.5 : 0.8;
              
              missileMarker = (
                <circle
                  cx={projectedMissile.x}
                  cy={projectedMissile.y}
                  r={markerSize}
                  fill={timeBasedStatus === 'PENDING' ? 'blue' : 
                        timeBasedStatus === 'IMPACT' ? 'red' : 'gray'}
                  opacity={markerOpacity}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            }
          }

          return (
            <g key={trajectory.id}>
              {/* Render trajectory path */}
              <path
                d={pathData}
                stroke={lineColor}
                strokeWidth={lineWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={lineDash}
              />
              
              {/* DEBUG: Show all raw projected points */}
              {isDebugMode && rawProjectedPoints.map((point, i) => 
                isPointValid(point) && (
                  <circle
                    key={`raw-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r="1"
                    fill={i % 10 === 0 ? "yellow" : "white"}
                    opacity={0.5}
                  />
                )
              )}
              
              {/* DEBUG: Show all processed points */}
              {isDebugMode && processedPoints.map((point, i) => 
                point.x !== -999 && point.y !== -999 && (
                  <circle
                    key={`proc-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r="1.5"
                    fill="magenta"
                    opacity={0.7}
                  />
                )
              )}
              
              {/* Render launch point if valid - only for ACTIVE missiles as a red outline circle */}
              {isPointValid(projectedLaunch) && timeBasedStatus === 'ACTIVE' && (
                <circle
                  cx={clippedLaunch.x}
                  cy={clippedLaunch.y}
                  r={launchPointRadius}
                  fill="none"
                  stroke="rgba(255, 0, 0, 0.7)"
                  strokeWidth="1"
                  opacity={isPointVisible(projectedLaunch) ? 1 : 0.3} // Fade if outside visible area
                />
              )}
              
              {/* Render target/impact point if valid */}
              {isPointValid(projectedTarget) && (
                <circle
                  cx={clippedTarget.x}
                  cy={clippedTarget.y}
                  r={impactRadius}
                  fill={
                    timeBasedStatus === 'IMPACT' ? 'rgba(255, 255, 255, 0.9)' : // White for impact
                    timeBasedStatus === 'ACTIVE' ? 'rgba(255, 255, 0, 0.6)' :   // Yellow for active (unchanged)
                    timeBasedStatus === 'EXPIRED' ? 'rgba(128, 128, 128, 0.5)' : // Gray for expired
                    'rgba(255, 255, 0, 0.6)' // Default yellow
                  }
                  opacity={isPointVisible(projectedTarget) ? 1 : 0.3} // Fade if outside visible area
                />
              )}
              
              {/* Debug info */}
              {isDebugMode && missilePosition && (
                <text
                  x={projectCoordinates(missilePosition).x + 8}
                  y={projectCoordinates(missilePosition).y - 8}
                  fontSize="10"
                  fill="white"
                  stroke="black"
                  strokeWidth="0.5"
                  paintOrder="stroke"
                >
                  {trajectory.id}: {timeBasedStatus}
                </text>
              )}
              
              {/* Render current missile position for ACTIVE missiles */}
              {timeBasedStatus === 'ACTIVE' && missilePosition && (
                <g>
                  {/* Get the projected position */}
                  {(() => {
                    const projectedMissile = projectCoordinates(missilePosition);
                    
                    // Only render if the missile position is valid
                    if (isPointValid(projectedMissile)) {
                      // Clip to ensure it stays within reasonable bounds
                      const clippedMissile = clipPoint(projectedMissile);
                      
                      // Render the missile position
                      return (
                        <circle
                          cx={clippedMissile.x}
                          cy={clippedMissile.y}
                          r={lineWidth} // Match the line width
                          fill="white"
                          opacity={isPointVisible(projectedMissile) ? 0.9 : 0.5} // Fade if outside visible area
                        />
                      );
                    }
                    return null;
                  })()}
                </g>
              )}
              
              {/* Render missile position marker */}
              {missileMarker}
            </g>
          );
        })}
        
        {/* Add animation keyframes for pulse effect */}
        <defs>
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 0.9; stroke-width: 1; }
                50% { opacity: 0.5; stroke-width: 1.5; }
                100% { opacity: 0.9; stroke-width: 1; }
              }
            `}
          </style>
        </defs>
      </svg>
    </>
  );
};

export default MissileLayer; 