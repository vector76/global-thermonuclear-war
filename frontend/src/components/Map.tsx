import React from 'react';
import '../styles/Map.css';
import MapView from './maps/MapView';
import { PROJECTION_CONFIGS } from '../services/projections';

interface MapProps {
  isAdmin?: boolean;
  showCoordinateGrid?: boolean;
}

function Map({ isAdmin = false, showCoordinateGrid = false }: MapProps): React.ReactElement {
  const [currentMap, setCurrentMap] = React.useState<'world' | 'us' | 'russia'>('world');
  const [trajectories, setTrajectories] = React.useState([]);

  const handlePrevMap = () => {
    if (currentMap === 'us') {
      setCurrentMap('world');
    } else if (currentMap === 'russia') {
      setCurrentMap('us');
    }
  };

  const handleNextMap = () => {
    if (currentMap === 'world') {
      setCurrentMap('us');
    } else if (currentMap === 'us') {
      setCurrentMap('russia');
    }
  };

  // Get the map title based on current selection
  const getMapTitle = () => {
    switch (currentMap) {
      case 'world': return 'World Map';
      case 'us': return 'United States Map';
      case 'russia': return 'Russia Map';
      default: return 'Map';
    }
  };

  // Get the appropriate projection config based on current map
  const getProjectionConfig = () => {
    switch (currentMap) {
      case 'world':
        return {
          type: 'equirectangular',
          config: PROJECTION_CONFIGS.EQUIRECTANGULAR
        };
      case 'us':
        return {
          type: 'conic',
          config: PROJECTION_CONFIGS.CONTINENTAL_US
        };
      case 'russia':
        return {
          type: 'conic',
          config: PROJECTION_CONFIGS.RUSSIA
        };
      default:
        return {
          type: 'equirectangular',
          config: PROJECTION_CONFIGS.EQUIRECTANGULAR
        };
    }
  };

  const projectionInfo = getProjectionConfig();

  return (
    <div className="map-container">
      <MapView 
        projectionType={projectionInfo.type as 'equirectangular' | 'polar' | 'conic'}
        config={projectionInfo.config}
        trajectories={trajectories}
        isAdmin={isAdmin}
        showCoordinateGrid={showCoordinateGrid}
      />
      
      {/* Map navigation arrows */}
      <div className="map-navigation">
        <button 
          className="map-nav-button prev"
          onClick={handlePrevMap}
          disabled={currentMap === 'world'}
          title={currentMap === 'us' ? 'Switch to World Map' : 'Switch to US Map'}
        >
          &#8592; {/* Left arrow */}
        </button>
        <div className="map-title">
          {getMapTitle()}
        </div>
        <button 
          className="map-nav-button next"
          onClick={handleNextMap}
          disabled={currentMap === 'russia'}
          title={currentMap === 'world' ? 'Switch to US Map' : 'Switch to Russia Map'}
        >
          &#8594; {/* Right arrow */}
        </button>
      </div>
    </div>
  );
}

export default Map; 