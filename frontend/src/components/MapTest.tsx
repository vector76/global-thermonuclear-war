import React, { useEffect, useState } from 'react';

function MapTest(): React.ReactElement {
  const [worldMap, setWorldMap] = useState<string>('');
  const [usMap, setUsMap] = useState<string>('');
  const [russiaMap, setRussiaMap] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load world map
        const worldResponse = await fetch('/world_map.svg');
        if (!worldResponse.ok) {
          throw new Error(`Failed to load world map: ${worldResponse.status}`);
        }
        const worldContent = await worldResponse.text();
        setWorldMap(worldContent);

        // Load US map
        const usResponse = await fetch('/conic_us_map.svg');
        if (!usResponse.ok) {
          throw new Error(`Failed to load US map: ${usResponse.status}`);
        }
        const usContent = await usResponse.text();
        setUsMap(usContent);

        // Load Russia map
        const russiaResponse = await fetch('/conic_russia_map.svg');
        if (!russiaResponse.ok) {
          throw new Error(`Failed to load Russia map: ${russiaResponse.status}`);
        }
        const russiaContent = await russiaResponse.text();
        setRussiaMap(russiaContent);

        setLoading(false);
      } catch (err) {
        console.error('Error loading maps:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadMaps();
  }, []);

  if (loading) {
    return <div>Loading maps...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Map Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>World Map</h2>
        <div style={{ maxWidth: '800px', border: '1px solid #333' }}>
          <div dangerouslySetInnerHTML={{ __html: worldMap }} />
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>US Map</h2>
        <div style={{ maxWidth: '800px', border: '1px solid #333' }}>
          <div dangerouslySetInnerHTML={{ __html: usMap }} />
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Russia Map</h2>
        <div style={{ maxWidth: '800px', border: '1px solid #333' }}>
          <div dangerouslySetInnerHTML={{ __html: russiaMap }} />
        </div>
      </div>
    </div>
  );
}

export default MapTest; 