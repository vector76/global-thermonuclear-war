import React, { useEffect, useState } from 'react';
import { 
  BaseProjection,
  EquirectangularProjection,
  PolarProjection,
  ConicProjection,
  PROJECTION_CONFIGS
} from '../../services/projections';
import { 
  ProjectionConfig, 
  ConicProjectionConfig,
  PolarProjectionConfig,
  MissileTrajectory 
} from '../../types';
import MissileLayer from './MissileLayer';
import CoordinateGridLayer from './CoordinateGridLayer';

interface MapViewProps {
  projectionType: 'equirectangular' | 'polar' | 'conic';
  config: ProjectionConfig | ConicProjectionConfig | PolarProjectionConfig;
  trajectories: MissileTrajectory[];
  className?: string;
  isAdmin?: boolean;
  svgContent?: string;
  showCoordinateGrid?: boolean;
}

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

  useEffect(() => {
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
        proj = new ConicProjection(config as ConicProjectionConfig);
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
    
    let mapFile = '/world_map.svg';
    
    if (projectionType === 'polar') {
      mapFile = '/polar_map.svg';
    } else if (projectionType === 'conic') {
      // For conic, we need to determine which region
      const conicConfig = config as ConicProjectionConfig;
      if (conicConfig.centerLon === -98) {
        mapFile = '/conic_us_map.svg';
      } else if (conicConfig.centerLon === 90) {
        mapFile = '/conic_russia_map.svg';
      }
    }
    
    console.log(`MapView: Fetching map: ${mapFile}`);
    
    fetch(mapFile)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load map: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(content => {
        console.log(`MapView: Received SVG content, length=${content.length}`);
        
        if (content.length === 0) {
          throw new Error('Received empty SVG content');
        }
        
        // Extract the original viewBox if it exists
        const viewBoxMatch = content.match(/viewBox=["']([^"']*)["']/);
        const originalViewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${config.width} ${config.height}`;
        
        // Remove any style tags from the SVG
        let cleanedContent = content.replace(/<style>.*?<\/style>/gs, '');
        
        // Add our own styling but keep it responsive and preserve the original viewBox
        cleanedContent = cleanedContent.replace(/<svg[^>]*/, 
          `<svg viewBox="${originalViewBox}"`
        );
        
        console.log(`MapView: Processed SVG content, length=${cleanedContent.length}`);
        
        setLoadedSvgContent(cleanedContent);
        setError(null);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(`Error loading map:`, error);
        setError(error.message || 'Failed to load map');
        setIsLoading(false);
      });
  }, [projectionType, config, svgContent]);

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
    <div className={`map-view ${className}`}>
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
    </div>
  );
};

export default MapView; 