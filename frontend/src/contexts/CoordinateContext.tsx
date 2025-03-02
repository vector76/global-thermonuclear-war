import React, { createContext, useContext, useState } from 'react';
import { Coordinates } from '../types';

interface CoordinateContextType {
  selectedCoordinates: Coordinates | null;
  setSelectedCoordinates: (coords: Coordinates | null) => void;
}

const CoordinateContext = createContext<CoordinateContextType | undefined>(undefined);

export const CoordinateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);

  return (
    <CoordinateContext.Provider value={{ selectedCoordinates, setSelectedCoordinates }}>
      {children}
    </CoordinateContext.Provider>
  );
};

export const useCoordinates = (): CoordinateContextType => {
  const context = useContext(CoordinateContext);
  if (context === undefined) {
    throw new Error('useCoordinates must be used within a CoordinateProvider');
  }
  return context;
}; 