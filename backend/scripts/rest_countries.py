import requests
import json
import csv
from typing import List, Dict

def fetch_country_coordinates() -> List[Dict]:
    """
    Fetches country data including coordinates from restcountries API
    Returns a list of dictionaries containing country info
    """
    try:
        # API endpoint for all countries
        url = "https://restcountries.com/v3.1/all"
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        
        # Parse JSON response
        countries = response.json()
        
        # Extract relevant data
        country_data = []
        for country in countries:
            try:
                # Get country name and coordinates
                name = country.get('name', {}).get('common', 'Unknown')
                latlng = country.get('latlng', [])
                
                if latlng and len(latlng) >= 2:
                    data = {
                        'country': name,
                        'latitude': latlng[0],
                        'longitude': latlng[1]
                    }
                    country_data.append(data)
            except (KeyError, IndexError) as e:
                print(f"Error processing data for {name}: {e}")
                continue
                
        return country_data
    
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return []

def save_to_csv(country_data: List[Dict], filename: str = "country_coordinates.csv"):
    """
    Saves country coordinate data to a CSV file
    """
    if not country_data:
        print("No data to save")
        return
    
    try:
        # Define CSV headers
        headers = ['country', 'latitude', 'longitude']
        
        # Write to CSV file
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            writer.writerows(country_data)
            
        print(f"Data successfully saved to {filename}")
        
    except Exception as e:
        print(f"Error saving to CSV: {e}")

def main():
    print("Fetching country coordinate data...")
    country_data = fetch_country_coordinates()
    
    if country_data:
        print(f"Found data for {len(country_data)} countries")
        save_to_csv(country_data)
        
        # Print first few entries as a sample
        print("\nSample data:")
        for country in country_data[:5]:
            print(f"{country['country']}: ({country['latitude']}, {country['longitude']})")
    else:
        print("Failed to retrieve country data")

if __name__ == "__main__":
    main()