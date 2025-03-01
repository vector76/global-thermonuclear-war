import React from 'react';
import '../styles/Map.css';

function Map() {
  return (
    <div className="map-container">
      <img 
        src="/world-map.png"
        alt="World Map"
        className="map-background"
      />
      {/* Map overlay elements will go here (missiles, impacts, etc) */}
    </div>
  );
}

export default Map; 