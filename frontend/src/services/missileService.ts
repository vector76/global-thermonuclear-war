import axios from 'axios';
import { Coordinates } from '../types';

export interface MissileData {
  id: number;
  user_id: number;
  launch_latitude: number;
  launch_longitude: number;
  launch_time: string;
  target_latitude: number;
  target_longitude: number;
  impact_time: string;
  target_string: string;
}

export interface MissileState {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'IMPACT' | 'EXPIRED';
  launchCoordinates: Coordinates;
  targetCoordinates: Coordinates;
  launchTime: Date;
  impactTime: Date;
}

// Duration in milliseconds that a missile remains in IMPACT state after impact
export const IMPACT_DURATION_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Fetch all missiles from the API
 */
export const fetchMissiles = async (): Promise<MissileState[]> => {
  try {
    const response = await axios.get<MissileData[]>('/api/v1/missiles');
    
    return response.data.map(missile => {
      // Parse date strings as UTC
      const parseUTCDate = (dateStr: string): Date => {
        // Check if the string is in the format "YYYY-MM-DD HH:MM:SS" (from database)
        const dbFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (dbFormatRegex.test(dateStr)) {
          // Convert database format to ISO format with explicit UTC marker
          const [datePart, timePart] = dateStr.split(' ');
          const isoString = `${datePart}T${timePart}.000Z`;
          return new Date(isoString);
        } else {
          // For other formats, use standard parsing
          return new Date(dateStr);
        }
      };
      
      const launchTime = parseUTCDate(missile.launch_time);
      const impactTime = parseUTCDate(missile.impact_time);
      const now = new Date();
      
      // Determine missile state
      let status: MissileState['status'];
      if (now < launchTime) {
        status = 'PENDING';
      } else if (now < impactTime) {
        status = 'ACTIVE';
      } else if (now < new Date(impactTime.getTime() + IMPACT_DURATION_MS)) {
        status = 'IMPACT';
      } else {
        status = 'EXPIRED';
      }
      
      return {
        id: missile.id.toString(),
        status,
        launchCoordinates: {
          latitude: missile.launch_latitude,
          longitude: missile.launch_longitude
        },
        targetCoordinates: {
          latitude: missile.target_latitude,
          longitude: missile.target_longitude
        },
        launchTime,
        impactTime
      };
    });
  } catch (error) {
    console.error('Error fetching missiles:', error);
    return [];
  }
}; 