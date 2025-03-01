import requests
import json
import geojson
from typing import Dict, List
import csv
from shapely.geometry import Polygon, MultiPolygon
from shapely.geometry.polygon import LinearRing

def simplify_polygon(coordinates: List[List[float]], tolerance: float = 0.125) -> List[List[float]]:
    """
    Simplifies a polygon using Shapely's simplify method (RDP algorithm)
    Args:
        coordinates: List of [lon, lat] points
        tolerance: Distance threshold (degrees) for simplification
    Returns:
        Simplified list of [lon, lat] points
    """
    try:
        # Convert to Shapely Polygon
        ring = LinearRing(coordinates)
        simplified = ring.simplify(tolerance, preserve_topology=True)
        return list(simplified.coords)
    except Exception as e:
        print(f"Error simplifying polygon: {e}")
        return coordinates  # Return original if simplification fails

def fetch_country_borders() -> List[Dict]:
    """
    Fetches and simplifies country border polygons from Natural Earth dataset
    """
    try:
        url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
        response = requests.get(url)
        response.raise_for_status()
        
        data = geojson.loads(response.text)
        
        country_borders = []
        for feature in data.features:
            try:
                country_name = feature.properties.get('NAME', 'Unknown')
                geometry = feature.geometry
                
                coordinates = []
                if geometry.type == 'Polygon':
                    # Simplify the outer ring
                    simplified_coords = simplify_polygon(geometry.coordinates[0])
                    coordinates = [simplified_coords]
                elif geometry.type == 'MultiPolygon':
                    coordinates = [simplify_polygon(poly[0]) for poly in geometry.coordinates]
                
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

def save_to_csv(country_borders: List[Dict], filename: str = "simplified_country_borders.csv"):
    """
    Saves simplified country border data to a CSV file
    """
    if not country_borders:
        print("No data to save")
        return
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['country', 'polygon_id', 'coordinates'])
            
            for country_data in country_borders:
                country_name = country_data['country']
                for i, polygon in enumerate(country_data['borders']):
                    coords_str = json.dumps(polygon)
                    writer.writerow([country_name, i, coords_str])
                    
        print(f"Data successfully saved to {filename}")
        
    except Exception as e:
        print(f"Error saving to CSV: {e}")

def save_to_json(country_borders: List[Dict], filename: str = "simplified_country_borders.json"):
    """
    Saves simplified country border data to a JSON file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            #json.dump(country_borders, jsonfile, ensure_ascii=False, indent=2)
            json.dump(country_borders, jsonfile, ensure_ascii=False)
        print(f"Data successfully saved to {filename}")
    except Exception as e:
        print(f"Error saving to JSON: {e}")

def main():
    print("Fetching and simplifying country border polygon data...")
    country_borders = fetch_country_borders()
    
    if country_borders:
        print(f"Found border data for {len(country_borders)} countries")
        
        save_to_csv(country_borders)
        save_to_json(country_borders)
        
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