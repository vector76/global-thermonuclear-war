import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMissiles } from '../services/missileService';
import { MissileTrajectory } from '../types';

interface MissileContextType {
  trajectories: MissileTrajectory[];
  loading: boolean;
  error: string | null;
  refreshMissiles: () => Promise<void>;
}

const MissileContext = createContext<MissileContextType | undefined>(undefined);

export const MissileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trajectories, setTrajectories] = useState<MissileTrajectory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMissiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const missiles = await fetchMissiles();
      
      // Convert missile data to trajectories
      const newTrajectories: MissileTrajectory[] = missiles.map(missile => ({
        id: missile.id,
        points: [missile.launchCoordinates, missile.targetCoordinates],
        launchPoint: missile.launchCoordinates,
        targetPoint: missile.targetCoordinates,
        launchTime: missile.launchTime,
        impactTime: missile.impactTime
      }));
      
      setTrajectories(newTrajectories);
    } catch (err) {
      console.error('Error loading missiles:', err);
      setError('Failed to load missiles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch missiles on component mount and periodically
  useEffect(() => {
    // Load missiles immediately
    loadMissiles();
    
    // Then refresh every 60 seconds
    const intervalId = setInterval(loadMissiles, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [loadMissiles]);

  // Function to manually refresh missiles (to be called after launch)
  const refreshMissiles = useCallback(async () => {
    await loadMissiles();
  }, [loadMissiles]);

  return (
    <MissileContext.Provider value={{ trajectories, loading, error, refreshMissiles }}>
      {children}
    </MissileContext.Provider>
  );
};

export const useMissiles = (): MissileContextType => {
  const context = useContext(MissileContext);
  if (context === undefined) {
    throw new Error('useMissiles must be used within a MissileProvider');
  }
  return context;
}; 