import React, { useState } from 'react';
import '../styles/Map.css';
import MapView from './maps/MapView';
import { PROJECTION_CONFIGS } from '../services/projections';
import { Coordinates } from '../types';
import { useMissiles } from '../contexts/MissileContext';

interface MapProps {
  isAdmin?: boolean;
  showCoordinateGrid?: boolean;
}

function Map({ isAdmin = false, showCoordinateGrid = false }: MapProps): React.ReactElement {
  const [currentMap, setCurrentMap] = useState<'world' | 'us' | 'russia'>('world');
  const { trajectories, loading, error } = useMissiles();

  // Filter trajectories based on current map bounds
  const getFilteredTrajectories = () => {
    // If world map, show all trajectories
    if (currentMap === 'world') {
      return trajectories;
    }
    
    // Get the bounds for the current map
    const bounds = (() => {
      if (currentMap === 'us') {
        return PROJECTION_CONFIGS.CONTINENTAL_US.bounds;
      } else if (currentMap === 'russia') {
        return PROJECTION_CONFIGS.RUSSIA.bounds;
      }
      return null;
    })();
    
    // If no bounds defined, return all trajectories
    if (!bounds) {
      return trajectories;
    }
    
    // Expand bounds slightly to include missiles that might be just off the map
    const expandedBounds = {
      minLat: bounds.minLat - 10,
      maxLat: bounds.maxLat + 10,
      minLon: bounds.minLon - 20,
      maxLon: bounds.maxLon + 20
    };
    
    // Check if a point is within the expanded bounds
    const isPointInBounds = (point: Coordinates) => {
      return (
        point.latitude >= expandedBounds.minLat && 
        point.latitude <= expandedBounds.maxLat &&
        point.longitude >= expandedBounds.minLon && 
        point.longitude <= expandedBounds.maxLon
      );
    };
    
    // Check if a line segment might intersect with the map bounds
    const mightIntersectBounds = (start: Coordinates, end: Coordinates) => {
      // If either point is in bounds, the segment might be visible
      if (isPointInBounds(start) || isPointInBounds(end)) {
        return true;
      }
      
      // Check if the segment crosses any of the bounds' edges
      // This is a simplified check that might have false positives but few false negatives
      
      // Check if segment crosses latitude bounds
      if ((start.latitude < expandedBounds.minLat && end.latitude > expandedBounds.maxLat) ||
          (start.latitude > expandedBounds.maxLat && end.latitude < expandedBounds.minLat)) {
        // Interpolate longitude at the boundary crossing
        const t = (expandedBounds.minLat - start.latitude) / (end.latitude - start.latitude);
        const lon = start.longitude + t * (end.longitude - start.longitude);
        if (lon >= expandedBounds.minLon && lon <= expandedBounds.maxLon) {
          return true;
        }
      }
      
      // Check if segment crosses longitude bounds
      if ((start.longitude < expandedBounds.minLon && end.longitude > expandedBounds.maxLon) ||
          (start.longitude > expandedBounds.maxLon && end.longitude < expandedBounds.minLon)) {
        // Interpolate latitude at the boundary crossing
        const t = (expandedBounds.minLon - start.longitude) / (end.longitude - start.longitude);
        const lat = start.latitude + t * (end.latitude - start.latitude);
        if (lat >= expandedBounds.minLat && lat <= expandedBounds.maxLat) {
          return true;
        }
      }
      
      return false;
    };
    
    // Filter trajectories that might be visible on the map
    return trajectories.filter(trajectory => {
      return mightIntersectBounds(trajectory.launchPoint, trajectory.targetPoint);
    });
  };

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
  const filteredTrajectories = getFilteredTrajectories();

  return (
    <div className="map-container">
      <MapView 
        projectionType={projectionInfo.type as 'equirectangular' | 'polar' | 'conic'}
        config={projectionInfo.config}
        trajectories={filteredTrajectories}
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
          {loading && <span className="loading-indicator"> (Loading...)</span>}
          {error && <span className="error-indicator"> (Error: {error})</span>}
          {filteredTrajectories.length > 0 && 
            <span className="missile-count"> ({filteredTrajectories.length} missile{filteredTrajectories.length !== 1 ? 's' : ''})</span>
          }
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