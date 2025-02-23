import React from 'react';
import LaunchForm from '../components/LaunchForm';

function Home({ isAuthenticated }) {
  return (
    <div>
      <h1>Global Thermonuclear War</h1>
      <div className="placeholder-map">
        [World Map Placeholder]
      </div>
      {/* Launch controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4">
        <div className="max-w-md mx-auto">
          <LaunchForm isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}

export default Home; 