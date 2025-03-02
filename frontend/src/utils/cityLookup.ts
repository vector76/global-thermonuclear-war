import axios from 'axios';

interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  population?: number;
  admin1_code?: string;
}

class CityLookup {
  private cities: City[] = [];
  private isLoaded: boolean = false;
  private isLoading: boolean = false;

  /**
   * Load the city database from the static CSV file
   */
  async loadCities(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      const response = await axios.get('/cities.csv');
      const csvData = response.data;
      
      // Parse CSV data
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      // Find column indices
      const nameIndex = headers.indexOf('name');
      const countryIndex = headers.indexOf('country_code');
      const latIndex = headers.indexOf('latitude');
      const lngIndex = headers.indexOf('longitude');
      const popIndex = headers.indexOf('population');
      const admin1Index = headers.indexOf('admin1_code');
      
      // Parse each line
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        
        this.cities.push({
          name: values[nameIndex],
          country: values[countryIndex],
          latitude: parseFloat(values[latIndex]),
          longitude: parseFloat(values[lngIndex]),
          population: popIndex >= 0 ? parseInt(values[popIndex], 10) : undefined,
          admin1_code: admin1Index >= 0 ? values[admin1Index] : undefined
        });
      }
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load city database:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Parse a target string into coordinates
   * @param targetString City name or coordinates
   * @returns Object with latitude and longitude, or null if not found
   */
  async parseTarget(targetString: string): Promise<{ latitude: number; longitude: number; name?: string } | null> {
    // Ensure cities are loaded
    if (!this.isLoaded) {
      await this.loadCities();
    }

    // Trim input
    const input = targetString.trim();
    
    // Check if it's a coordinate pair (e.g., "40.7128,-74.0060")
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const coordMatch = input.match(coordRegex);
    
    if (coordMatch) {
      const latitude = parseFloat(coordMatch[1]);
      const longitude = parseFloat(coordMatch[3]);
      
      // Validate coordinates
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        return { latitude, longitude };
      } else {
        return null; // Invalid coordinates
      }
    }
    
    // Check if it's a city name
    // First, try to parse as "City, Country" or "City, State" format
    const parts = input.split(',').map(part => part.trim());
    const cityName = parts[0].toLowerCase();
    let countryCode = parts.length > 1 ? parts[1].toLowerCase() : undefined;
    let stateCode: string | undefined = undefined;
    
    // Check if the second part is a US state code
    if (countryCode && countryCode.length === 2 && /^[a-z]{2}$/.test(countryCode)) {
      // This looks like a US state abbreviation
      stateCode = countryCode.toUpperCase();
      countryCode = 'us'; // Set country to US
    }
    
    let matches: City[] = [];
    
    // Try exact match first
    if (stateCode) {
      // Search for US city with state
      matches = this.cities.filter(
        city => city.name.toLowerCase() === cityName && 
                city.country.toLowerCase() === 'us' &&
                city.admin1_code === stateCode
      );
    } else if (countryCode) {
      // Search for city with country
      matches = this.cities.filter(
        city => city.name.toLowerCase() === cityName && 
                city.country.toLowerCase() === countryCode
      );
    } else {
      // Search for city without country
      matches = this.cities.filter(
        city => city.name.toLowerCase() === cityName
      );
    }
    
    // If no exact matches, try partial matches or common variations
    if (matches.length === 0) {
      // Try to match cities that contain the search term
      if (stateCode) {
        // Search for US city with state
        matches = this.cities.filter(
          city => city.name.toLowerCase().includes(cityName) && 
                  city.country.toLowerCase() === 'us' &&
                  city.admin1_code === stateCode
        );
      } else if (countryCode) {
        matches = this.cities.filter(
          city => city.name.toLowerCase().includes(cityName) && 
                  city.country.toLowerCase() === countryCode
        );
      } else {
        matches = this.cities.filter(
          city => city.name.toLowerCase().includes(cityName)
        );
      }
      
      // Special case for common city name variations
      if (matches.length === 0) {
        // Handle "New York" -> "New York City"
        if (cityName === "new york") {
          matches = this.cities.filter(city => 
            city.name.toLowerCase() === "new york city"
          );
        }
        // Add more special cases as needed
      }
    }
    
    // If multiple matches, sort by population (descending)
    if (matches.length > 1) {
      matches.sort((a, b) => (b.population || 0) - (a.population || 0));
    }
    
    // Return the first match (most populous)
    if (matches.length > 0) {
      const match = matches[0];
      return {
        latitude: match.latitude,
        longitude: match.longitude,
        name: `${match.name}, ${match.country === 'US' ? match.admin1_code : match.country}`
      };
    }
    
    return null; // No match found
  }
}

// Create a singleton instance
const cityLookup = new CityLookup();
export default cityLookup; 