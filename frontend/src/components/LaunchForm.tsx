import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

interface LaunchFormProps {
  isAuthenticated: boolean;
}

interface ErrorResponse {
  detail: string;
}

export default function LaunchForm({ isAuthenticated }: LaunchFormProps): React.ReactElement {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to launch missiles');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates');
      }
      const response = await axios.post(
        `/api/v1/missiles/launch?target_latitude=${lat.toString()}&target_longitude=${lng.toString()}`
      );
      setLatitude('');
      setLongitude('');
      setSuccess('Missile launched successfully');
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
      } else {
        setError('Launch failed');
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void): void => {
    setter(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="number"
        step="any"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => handleInputChange(e, setLatitude)}
        className={`w-24 p-1 rounded bg-gray-800 text-white ${!isAuthenticated ? 'opacity-50' : ''}`}
        disabled={!isAuthenticated}
      />
      <input
        type="number"
        step="any"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => handleInputChange(e, setLongitude)}
        className={`w-24 p-1 rounded bg-gray-800 text-white ${!isAuthenticated ? 'opacity-50' : ''}`}
        disabled={!isAuthenticated}
      />
      <button 
        type="submit" 
        className={`bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!isAuthenticated}
      >
        Launch
      </button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
      {success && <span className="text-green-500 text-sm">{success}</span>}
      {!isAuthenticated && <span className="text-gray-400 text-sm">Log in to launch missiles</span>}
    </form>
  );
} 