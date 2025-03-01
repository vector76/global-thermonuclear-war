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

interface MapViewProps {
  projectionType: 'equirectangular' | 'polar' | 'conic';
  config: ProjectionConfig | ConicProjectionConfig | PolarProjectionConfig;
  trajectories: MissileTrajectory[];
  className?: string;
}

const MapView = ({
  projectionType,
  config,
  trajectories,
  className = ''
}: MapViewProps) => {
  const [svgContent, setSvgContent] = useState('');
  const [projection, setProjection] = useState(null as BaseProjection | null);

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

    // Load the appropriate SVG map
    fetch(`/maps/${projectionType}_map.svg`)
      .then(response => response.text())
      .then(content => {
        // Remove any style tags from the SVG
        let cleanedContent = content.replace(/<style>.*?<\/style>/gs, '');
        
        // Add our own styling
        cleanedContent = cleanedContent.replace(/<svg/, 
          `<svg style="background-color: #000716;" width="${config.width}" height="${config.height}"`
        );
        
        setSvgContent(cleanedContent);
      })
      .catch(error => {
        console.error(`Error loading ${projectionType} map:`, error);
      });
  }, [projectionType, config]);

  if (!projection || !svgContent) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      className={`map-view ${className}`}
      style={{ 
        position: 'relative',
        width: config.width,
        height: config.height,
        overflow: 'hidden'
      }}
    >
      {/* Base map */}
      <div 
        className="map-background"
        style={{
          filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
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