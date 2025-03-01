import React from 'react';
import Map from '../components/Map';
import LaunchForm from '../components/LaunchForm';

interface HomeProps {
  isAuthenticated: boolean;
}

function Home({ isAuthenticated }: HomeProps): React.ReactElement {
  return (
    <div>
      <h1>Global Thermonuclear War</h1>
      <Map />
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