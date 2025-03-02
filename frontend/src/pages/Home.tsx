import React, { useState } from 'react';
import Map from '../components/Map';
import LaunchForm from '../components/LaunchForm';

interface HomeProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

function Home({ isAuthenticated, isAdmin }: HomeProps): React.ReactElement {
  const [showCoordinateGrid, setShowCoordinateGrid] = useState(false);

  return (
    <div>
      <h1>Global Thermonuclear War</h1>
      <Map isAdmin={isAdmin} showCoordinateGrid={showCoordinateGrid} />
      {/* Launch controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <LaunchForm isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
          
          {/* Coordinate grid toggle */}
          {isAdmin && (
            <label className="flex items-center text-white ml-4 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCoordinateGrid} 
                onChange={() => setShowCoordinateGrid(!showCoordinateGrid)}
                className="mr-2"
              />
              Show Coordinate Grid
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home; 