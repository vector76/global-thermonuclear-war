import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import cityLookup from '../utils/cityLookup';

interface LaunchFormProps {
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

interface ErrorResponse {
  detail: string;
}

export default function LaunchForm({ isAuthenticated, isAdmin = false }: LaunchFormProps): React.ReactElement {
  const [targetString, setTargetString] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to launch missiles');
      return;
    }
    setError('');
    setSuccess('');
    setLookupResult('');
    
    try {
      // Parse the target string to get coordinates
      const target = await cityLookup.parseTarget(targetString);
      if (!target) {
        throw new Error('Invalid target location');
      }
      
      // Launch the missile with the parsed coordinates
      const response = await axios.post(
        `/api/v1/missiles/launch?target_latitude=${target.latitude.toString()}&target_longitude=${target.longitude.toString()}`
      );
      
      setTargetString('');
      setSuccess(`Missile launched successfully targeting ${target.name || `${target.latitude}, ${target.longitude}`}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          // Rate limit error - use the server's detailed message
          setError((err.response.data as ErrorResponse).detail || 'Rate limit exceeded');
        } else if (err.response?.status === 400) {
          setError('Invalid coordinates');
        } else if (err.response?.status === 401) {
          setError('Please log in to launch missiles');
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Launch failed');
      }
    }
  };

  const handleTestLookup = async (): Promise<void> => {
    setError('');
    setSuccess('');
    setLookupResult('');
    
    try {
      // Parse the target string to get coordinates
      const target = await cityLookup.parseTarget(targetString);
      if (!target) {
        setLookupResult(`No match found for "${targetString}"`);
      } else {
        setLookupResult(`Found: ${target.name || targetString} at coordinates: ${target.latitude.toFixed(4)}, ${target.longitude.toFixed(4)}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setLookupResult(`Error: ${err.message}`);
      } else {
        setLookupResult('Lookup failed');
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setTargetString(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="City name or lat,lon coordinates"
        value={targetString}
        onChange={handleInputChange}
        style={{ width: '350px' }}
        className={`p-1 rounded bg-gray-800 text-white ${!isAuthenticated ? 'opacity-50' : ''}`}
        disabled={!isAuthenticated}
      />
      <button 
        type="submit" 
        className={`bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!isAuthenticated}
      >
        Launch
      </button>
      {isAdmin && (
        <button 
          type="button" 
          onClick={handleTestLookup}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Test Lookup
        </button>
      )}
      {error && <span className="text-red-500 text-sm">{error}</span>}
      {success && <span className="text-green-500 text-sm">{success}</span>}
      {lookupResult && <span className="text-yellow-500 text-sm">{lookupResult}</span>}
      {!isAuthenticated && <span className="text-gray-400 text-sm">Log in to launch missiles</span>}
    </form>
  );
} 