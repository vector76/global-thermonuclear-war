import requests
import json
import geojson
from typing import Dict, List
import csv

def fetch_country_borders() -> List[Dict]:
    """
    Fetches country border polygons from Natural Earth dataset via GitHub
    Returns a list of dictionaries containing country names and their border coordinates
    """
    try:
        # URL to Natural Earth countries GeoJSON (50m resolution)
        url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
        response = requests.get(url)
        response.raise_for_status()
        
        # Parse GeoJSON
        data = geojson.loads(response.text)
        
        country_borders = []
        for feature in data.features:
            try:
                # Extract country name and geometry
                country_name = feature.properties.get('NAME', 'Unknown')
                geometry = feature.geometry
                
                # Handle both Polygon and MultiPolygon types
                coordinates = []
                if geometry.type == 'Polygon':
                    coordinates = [geometry.coordinates[0]]  # Outer ring only
                elif geometry.type == 'MultiPolygon':
                    coordinates = [poly[0] for poly in geometry.coordinates]  # Outer rings
                
                if coordinates:
                    country_borders.append({
                        'country': country_name,
                        'borders': coordinates
                    })
            except (KeyError, AttributeError) as e:
                print(f"Error processing {country_name}: {e}")
                continue
                
        return country_borders
    
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return []

def save_to_csv(country_borders: List[Dict], filename: str = "country_borders.csv"):
    """
    Saves country border data to a CSV file
    Note: Each row will represent one polygon; multi-polygon countries will have multiple rows
    """
    if not country_borders:
        print("No data to save")
        return
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            # Write header
            writer.writerow(['country', 'polygon_id', 'coordinates'])
            
            # Write data
            for country_data in country_borders:
                country_name = country_data['country']
                for i, polygon in enumerate(country_data['borders']):
                    # Convert coordinates to string for CSV
                    coords_str = json.dumps(polygon)
                    writer.writerow([country_name, i, coords_str])
                    
        print(f"Data successfully saved to {filename}")
        
    except Exception as e:
        print(f"Error saving to CSV: {e}")

def save_to_json(country_borders: List[Dict], filename: str = "country_borders.json"):
    """
    Saves country border data to a JSON file for easier programmatic use
    """
    try:
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(country_borders, jsonfile, ensure_ascii=False, indent=2)
        print(f"Data successfully saved to {filename}")
    except Exception as e:
        print(f"Error saving to JSON: {e}")

def main():
    print("Fetching country border polygon data...")
    country_borders = fetch_country_borders()
    
    if country_borders:
        print(f"Found border data for {len(country_borders)} countries")
        
        # Save to both CSV and JSON
        save_to_csv(country_borders)
        save_to_json(country_borders)
        
        # Print sample data
        print("\nSample data (first 3 countries):")
        for country in country_borders[:3]:
            polygons = len(country['borders'])
            points = sum(len(poly) for poly in country['borders'])
            print(f"{country['country']}: {polygons} polygon(s) with {points} total points")
            print(f"First few coordinates of first polygon: {country['borders'][0][:3]}")
            print()
    else:
        print("Failed to retrieve country border data")

if __name__ == "__main__":
    main()