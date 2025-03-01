import json
from typing import Dict, List

def load_country_borders(filename: str = "simplified_country_borders.json") -> List[Dict]:
    """
    Loads country border data from a local JSON file
    """
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            country_borders = json.load(f)
        print(f"Loaded data from {filename}")
        return country_borders
    except FileNotFoundError:
        print(f"Error: {filename} not found. Please ensure the file exists.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {filename}: {e}")
        return []

def normalize_coordinates(coordinates: List[List[float]], width: int, height: int) -> List[List[float]]:
    """
    Normalizes lon/lat coordinates to SVG viewbox (0-360 width, 0-180 height)
    longitude: -180 to 180 -> 0 to 360
    latitude: -90 to 90 -> 180 to 0 (flipped for SVG y-axis)
    """
    normalized = []
    for lon, lat in coordinates:
        x = (lon + 180)  # Shift longitude to 0-360
        y = (90 - lat)   # Shift and flip latitude to 0-180
        normalized.append([x, y])
    return normalized

def generate_svg(country_borders: List[Dict], filename: str = "world_map.svg", width: int = 360, height: int = 180):
    """
    Generates an SVG file from country border data
    """
    # SVG header
    svg_content = [
        f'<svg width="{width*2}" height="{height*2}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '  path { fill: #f0f0f0; stroke: #666; stroke-width: 0.1; }',
        '  path:hover { fill: #ddd; }',
        '</style>'
    ]
    
    # Generate paths for each country
    for country_data in country_borders:
        country_name = country_data['country']
        for polygon in country_data['borders']:
            # Normalize coordinates to SVG space
            norm_coords = normalize_coordinates(polygon, width, height)
            
            # Create SVG path
            path_data = "M " + " L ".join(f"{x},{y}" for x, y in norm_coords) + " Z"
            svg_content.append(f'<path d="{path_data}" title="{country_name}"/>')
    
    # SVG footer
    svg_content.append('</svg>')
    
    # Write to file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg_content))
    print(f"SVG map saved as {filename}")

def main():
    # Load previously downloaded data
    # Change the filename to match your saved data (e.g., "country_borders.json" for full resolution)
    country_borders = load_country_borders("simplified_country_borders.json")
    
    if country_borders:
        print(f"Rendering {len(country_borders)} countries to SVG...")
        generate_svg(country_borders)
        
        # Sample stats
        total_points = sum(sum(len(poly) for poly in country['borders']) 
                         for country in country_borders)
        print(f"Total points rendered: {total_points}")
    else:
        print("Failed to load country border data")

if __name__ == "__main__":
    main()