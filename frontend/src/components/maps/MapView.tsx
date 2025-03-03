import React, { useEffect, useState } from 'react';
import { 
  BaseProjection,
  EquirectangularProjection,
  PolarProjection,
  AlbersConicProjection,
  PROJECTION_CONFIGS
} from '../../services/projections';
import { 
  ProjectionConfig, 
  ConicProjectionConfig,
  PolarProjectionConfig,
  MissileTrajectory,
  ProjectedCoordinates,
  Coordinates
} from '../../types';
import MissileLayer from './MissileLayer';
import CoordinateGridLayer from './CoordinateGridLayer';
import { useCoordinates } from '../../contexts/CoordinateContext';

interface MapViewProps {
  projectionType: 'equirectangular' | 'polar' | 'conic';
  config: ProjectionConfig | ConicProjectionConfig | PolarProjectionConfig;
  trajectories: MissileTrajectory[];
  className?: string;
  isAdmin?: boolean;
  svgContent?: string;
  showCoordinateGrid?: boolean;
}

// Default scale and offset values for maps
// These match the values used in the Python map generation
const MAP_SCALE_OFFSETS = {
  'conic_us_map.svg': {
    scaleFactor: 668.659129,
    offsetX: -0.03,
    offsetY: 0.01
  },
  'conic_russia_map.svg': {
    scaleFactor: 493.219777,
    offsetX: 0.07,
    offsetY: 54.11
  }
};

const MapView = ({
  projectionType,
  config,
  trajectories,
  className = '',
  isAdmin = false,
  svgContent = '',
  showCoordinateGrid = false
}: MapViewProps) => {
  const [projection, setProjection] = useState(null as BaseProjection | null);
  const [loadedSvgContent, setLoadedSvgContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapFile, setMapFile] = useState('');
  // Add state for mouse coordinates
  const [mouseCoordinates, setMouseCoordinates] = useState<Coordinates | null>(null);
  // Get the coordinate context
  const { setSelectedCoordinates } = useCoordinates();

  useEffect(() => {
    // Determine which map file to load
    let mapFileName = '/world_map.svg';
    
    if (projectionType === 'polar') {
      mapFileName = '/polar_map.svg';
    } else if (projectionType === 'conic') {
      // For conic, we need to determine which region
      const conicConfig = config as ConicProjectionConfig;
      if (conicConfig.centerLon === -98) {
        mapFileName = '/conic_us_map.svg';
      } else if (conicConfig.centerLon === 100) {
        mapFileName = '/conic_russia_map.svg';
      }
    }
    
    setMapFile(mapFileName);
    
    // Initialize the appropriate projection
    let proj: BaseProjection;
    switch (projectionType) {
      case 'equirectangular':
        proj = new EquirectangularProjection(config);
        break;
      case 'polar':
        proj = new PolarProjection(config as PolarProjectionConfig);
        break;
      case 'conic':
        // Use AlbersConicProjection instead of ConicProjection for better accuracy
        const albersProj = new AlbersConicProjection(config as ConicProjectionConfig);
        
        // Apply custom scale and offset if available for this map
        const mapBaseName = mapFileName.split('/').pop() || '';
        if (mapBaseName in MAP_SCALE_OFFSETS) {
          const { scaleFactor, offsetX, offsetY } = MAP_SCALE_OFFSETS[mapBaseName as keyof typeof MAP_SCALE_OFFSETS];
          albersProj.setCustomScaleAndOffset(scaleFactor, offsetX, offsetY);
        }
        
        proj = albersProj;
        break;
      default:
        console.error('Unknown projection type:', projectionType);
        return;
    }
    setProjection(proj);

    // If svgContent is provided, use it
    if (svgContent) {
      // Make sure the SVG is responsive
      const responsiveSvg = svgContent.replace(/<svg[^>]*/, 
        '<svg viewBox="0 0 ' + config.width + ' ' + config.height + '"'
      );
      setLoadedSvgContent(responsiveSvg);
      setIsLoading(false);
      return;
    }

    // Otherwise, load the appropriate SVG map
    setIsLoading(true);
    setError(null);
    
    fetch(mapFileName)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load map: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(content => {
        if (content.length === 0) {
          throw new Error('Received empty SVG content');
        }
        
        // Extract the original viewBox if it exists
        const viewBoxMatch = content.match(/viewBox=["']([^"']*)["']/);
        const originalViewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${config.width} ${config.height}`;
        
        // Look for embedded scale and offset data in the SVG
        // This would be added by the Python script during map generation
        const scaleMatch = content.match(/data-scale=["']([^"']*)["']/);
        const offsetXMatch = content.match(/data-offset-x=["']([^"']*)["']/);
        const offsetYMatch = content.match(/data-offset-y=["']([^"']*)["']/);
        
        if (scaleMatch && offsetXMatch && offsetYMatch && projection instanceof AlbersConicProjection) {
          const scaleFactor = parseFloat(scaleMatch[1]);
          const offsetX = parseFloat(offsetXMatch[1]);
          const offsetY = parseFloat(offsetYMatch[1]);
          
          projection.setCustomScaleAndOffset(scaleFactor, offsetX, offsetY);
          
          // Update the default values for future use
          const mapBaseName = mapFileName.split('/').pop() || '';
          if (mapBaseName in MAP_SCALE_OFFSETS) {
            MAP_SCALE_OFFSETS[mapBaseName as keyof typeof MAP_SCALE_OFFSETS] = {
              scaleFactor,
              offsetX,
              offsetY
            };
          }
        }
        
        // Remove any style tags from the SVG
        let cleanedContent = content.replace(/<style>.*?<\/style>/gs, '');
        
        // Add our own styling but keep it responsive and preserve the original viewBox
        cleanedContent = cleanedContent.replace(/<svg[^>]*/, 
          `<svg viewBox="${originalViewBox}"`
        );
        
        setLoadedSvgContent(cleanedContent);
        setError(null);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.message || 'Failed to load map');
        setIsLoading(false);
      });
  }, [projectionType, config, svgContent]);

  // Handle mouse movement to track coordinates
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!projection) return;
    
    // Get the bounding rectangle of the map container
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Calculate the relative position within the map
    const x = (event.clientX - rect.left) / rect.width * config.width;
    const y = (event.clientY - rect.top) / rect.height * config.height;
    
    // Convert screen coordinates to lat/long using the projection
    try {
      const coords = projection.unproject({ x, y });
      setMouseCoordinates(coords);
    } catch (error) {
      // If unproject fails (e.g., outside valid range), clear coordinates
      setMouseCoordinates(null);
    }
  };

  // Handle mouse leave to clear coordinates
  const handleMouseLeave = () => {
    setMouseCoordinates(null);
  };

  // Handle click to set selected coordinates
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!projection) return;
    
    // Get the bounding rectangle of the map container
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Calculate the relative position within the map
    const x = (event.clientX - rect.left) / rect.width * config.width;
    const y = (event.clientY - rect.top) / rect.height * config.height;
    
    // Convert screen coordinates to lat/long using the projection
    try {
      const coords = projection.unproject({ x, y });
      // Update the coordinate context with the clicked coordinates
      setSelectedCoordinates(coords);
    } catch (error) {
      console.error('Error unprojecting coordinates:', error);
    }
  };

  if (!projection) {
    return <div>Loading projection...</div>;
  }

  if (isLoading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }

  const finalSvgContent = loadedSvgContent || svgContent;
  
  if (!finalSvgContent) {
    return <div>No map content available</div>;
  }

  return (
    <div 
      className={`map-view ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Base map */}
      <div 
        className="map-background"
        dangerouslySetInnerHTML={{ __html: finalSvgContent }}
      />

      {/* Coordinate grid layer */}
      <CoordinateGridLayer
        projectCoordinates={coords => projection.project(coords)}
        width={config.width}
        height={config.height}
        visible={showCoordinateGrid && isAdmin}
      />

      {/* Missile layer */}
      <MissileLayer
        trajectories={trajectories}
        projectCoordinates={coords => projection.project(coords)}
        width={config.width}
        height={config.height}
      />

      {/* Coordinates display */}
      {mouseCoordinates && (
        <div className="coordinates-display">
          {mouseCoordinates.latitude.toFixed(2)}°, {mouseCoordinates.longitude.toFixed(2)}°
        </div>
      )}
    </div>
  );
};

export default MapView; 