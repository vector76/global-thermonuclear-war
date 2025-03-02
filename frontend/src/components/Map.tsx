import React, { useEffect, useState } from 'react';
import '../styles/Map.css';

function Map(): React.ReactElement {
  const [svgContent, setSvgContent] = useState<string>('');
  const [currentMap, setCurrentMap] = useState<'world' | 'us' | 'russia'>('world');

  useEffect(() => {
    // Load the appropriate map based on currentMap state
    let mapFile = '/world_map.svg';
    
    if (currentMap === 'us') {
      mapFile = '/conic_us_map.svg';
    } else if (currentMap === 'russia') {
      mapFile = '/conic_russia_map.svg';
    }
    
    fetch(mapFile)
      .then(response => response.text())
      .then(content => {
        console.log(`Original ${currentMap} SVG length:`, content.length);

        // Remove any style tags from the SVG - we'll use our CSS instead
        let cleanedContent = content.replace(/<style>.*?<\/style>/gs, '');
        
        // Override any remaining style attributes
        cleanedContent = cleanedContent.replace(/<svg/, '<svg style="background-color: #000716;"');
        
        console.log(`Modified ${currentMap} SVG length:`, cleanedContent.length);
        
        setSvgContent(cleanedContent);
      })
      .catch(error => {
        console.error(`Error fetching ${currentMap} SVG:`, error);
      });
  }, [currentMap]); // Re-run when currentMap changes

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

  return (
    <div className="map-container">
      <div 
        className="map-background"
        style={{
          filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
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
      
      {/* Map overlay elements will go here (missiles, impacts, etc) */}
    </div>
  );
}

export default Map; 