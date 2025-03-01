import React, { useEffect, useState } from 'react';
import '../styles/Map.css';

interface SVGPathMatch extends Array<string> {
  0: string;  // The full match
  index: number;
  input: string;
  groups?: { [key: string]: string };
}

function Map(): React.ReactElement {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    fetch('/world_map.svg')
      .then(response => response.text())
      .then(content => {
        console.log('Original SVG length:', content.length);

        // Remove any style tags from the SVG
        let cleanedContent = content.replace(/<style>.*?<\/style>/gs, '');
        
        // Find ALL path elements for US and Russia using global flag
        const usRegex = /<path[^>]*title="United States of America"[^>]*>/g;
        const russiaRegex = /<path[^>]*title="Russia"[^>]*>/g;
        
        const usPaths = [...cleanedContent.matchAll(usRegex)].map(match => match[0]);
        const russiaPaths = [...cleanedContent.matchAll(russiaRegex)].map(match => match[0]);
        
        console.log('Found US paths:', usPaths.length);
        console.log('Found Russia paths:', russiaPaths.length);
        
        if (usPaths.length > 0 && russiaPaths.length > 0) {
          // Remove all original paths
          usPaths.forEach(path => {
            cleanedContent = cleanedContent.replace(path, '');
          });
          russiaPaths.forEach(path => {
            cleanedContent = cleanedContent.replace(path, '');
          });
          
          // Add them all back at the end with explicit stroke colors
          const modifiedUsPaths = usPaths.map(path => 
            path.includes('stroke=') ? 
              path.replace(/stroke="[^"]*"/, 'stroke="rgb(0, 191, 255)"') :
              path.replace(/path/, 'path stroke="rgb(0, 191, 255)"')
          );
          
          const modifiedRussiaPaths = russiaPaths.map(path =>
            path.includes('stroke=') ? 
              path.replace(/stroke="[^"]*"/, 'stroke="rgb(255, 50, 50)"') :
              path.replace(/path/, 'path stroke="rgb(255, 50, 50)"')
          );
          
          // Add all paths back in a group element
          cleanedContent = cleanedContent.replace('</svg>', 
            `<g class="highlighted-countries">
              ${modifiedUsPaths.join('\n')}
              ${modifiedRussiaPaths.join('\n')}
            </g>
            </svg>`
          );
        }
        
        // Override any remaining style attributes
        cleanedContent = cleanedContent.replace(/<svg/, '<svg style="background-color: #000716;"');
        
        console.log('Modified SVG length:', cleanedContent.length);
        
        setSvgContent(cleanedContent);
      })
      .catch(error => {
        console.error('Error fetching SVG:', error);
      });
  }, []);

  return (
    <div className="map-container">
      <div 
        className="map-background"
        style={{
          filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      {/* Map overlay elements will go here (missiles, impacts, etc) */}
    </div>
  );
}

export default Map; 