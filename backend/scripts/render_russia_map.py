import json
import math
import random
from typing import Dict, List, Tuple

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

def to_radians(degrees: float) -> float:
    return degrees * math.pi / 180

def normalize_longitude(lon: float) -> float:
    lon = lon % 360
    return lon - 360 if lon > 180 else (lon + 360 if lon < -180 else lon)

def clamp_latitude(lat: float) -> float:
    return max(-90, min(90, lat))

class ConicProjection:
    def __init__(self, config: Dict):
        self.config = config
        self.width = config['width']
        self.height = config['height']
        print("\nInitializing Conic Projection:")
        print(f"Config: {json.dumps(config, indent=2)}")
        
        # Pre-calculate constants used in projection
        phi1 = to_radians(config['standardParallel1'])
        phi2 = to_radians(config['standardParallel2'])
        phi0 = to_radians(config['centerLat'])
        
        print(f"\nStandard Parallels and Center:")
        print(f"φ1 (parallel 1): {config['standardParallel1']}° = {phi1:.6f} rad")
        print(f"φ2 (parallel 2): {config['standardParallel2']}° = {phi2:.6f} rad")
        print(f"φ0 (center lat): {config['centerLat']}° = {phi0:.6f} rad")
        
        # Corrected formulas for Albers Equal-Area Conic projection
        sin_phi1 = math.sin(phi1)
        sin_phi2 = math.sin(phi2)
        cos_phi1 = math.cos(phi1)
        cos_phi2 = math.cos(phi2)
        
        # Calculate n (cone constant)
        self.n = (sin_phi1 + sin_phi2) / 2
        
        # Calculate C (constant of the conic)
        self.C = cos_phi1**2 + 2 * self.n * sin_phi1
        
        # Calculate rho0 (radius to origin)
        self.rho0 = math.sqrt(self.C - 2 * self.n * math.sin(phi0)) / self.n
        
        print(f"\nCorrected Conic Constants:")
        print(f"sin(φ1): {sin_phi1:.6f}")
        print(f"sin(φ2): {sin_phi2:.6f}")
        print(f"cos(φ1): {cos_phi1:.6f}")
        print(f"cos(φ2): {cos_phi2:.6f}")
        print(f"n (cone constant): {self.n:.6f}")
        print(f"C (projection constant): {self.C:.6f}")
        print(f"ρ0 (radius to origin): {self.rho0:.6f}")

    def project(self, lon: float, lat: float, debug: bool = False, scale_factor: float = None) -> Tuple[float, float]:
        """
        Project coordinates using Albers Equal-Area Conic projection
        
        Args:
            lon: Longitude in degrees
            lat: Latitude in degrees
            debug: If True, print intermediate calculation values
            scale_factor: Optional custom scale factor to override the default
        """
        if debug:
            print(f"\n--- Projecting Point: ({lon:.4f}°, {lat:.4f}°) ---")
            
        # No longer filter points by lat/long bounds - project all points
        # Convert to radians and normalize
        clamped_lat = clamp_latitude(lat)
        if debug and clamped_lat != lat:
            print(f"Clamped latitude from {lat} to {clamped_lat}")
            
        normalized_lon = normalize_longitude(lon - self.config['centerLon'])
        if debug and normalized_lon != (lon - self.config['centerLon']):
            print(f"Normalized longitude from {lon - self.config['centerLon']} to {normalized_lon}")
            
        phi = to_radians(clamped_lat)
        lambda_ = to_radians(normalized_lon)
        
        if debug:
            print(f"φ (latitude in radians): {phi:.6f}")
            print(f"λ (longitude in radians): {lambda_:.6f}")
            print(f"sin(φ): {math.sin(phi):.6f}")

        # Calculate rho (radius)
        rho = math.sqrt(self.C - 2 * self.n * math.sin(phi)) / self.n
        
        # Calculate theta (angle)
        theta = self.n * lambda_
        
        if debug:
            print(f"ρ (radius): {rho:.6f}")
            print(f"θ (angle): {theta:.6f} radians = {theta * 180 / math.pi:.2f}°")
            print(f"sin(θ): {math.sin(theta):.6f}")
            print(f"cos(θ): {math.cos(theta):.6f}")

        # Apply scaling factor to make the map fill more of the viewport
        if scale_factor is None:
            # Use the default scale factor calculation if none provided
            scale_factor = min(self.width, self.height) / (0.6 * self.rho0)
            
        if debug:
            print(f"Scale factor: {scale_factor:.6f}")
        
        # Corrected orientation (flipped y-coordinate)
        x = self.width/2 + scale_factor * rho * math.sin(theta)
        y = self.height/2 + scale_factor * (rho * math.cos(theta) - self.rho0)
        
        if debug:
            print(f"x = width/2 + scale_factor * ρ·sin(θ) = {self.width/2} + {scale_factor} * {rho} * {math.sin(theta):.6f} = {x:.2f}")
            print(f"y = height/2 + scale_factor * (ρ·cos(θ) - ρ0) = {self.height/2} + {scale_factor} * ({rho} * {math.cos(theta):.6f} - {self.rho0}) = {y:.2f}")

        return (x, y)

def test_random_points(projection: ConicProjection, num_points: int = 5):
    """
    Test the projection with random points within the bounds and show all intermediate calculations
    """
    bounds = projection.config['bounds']
    print(f"\n=== Testing {num_points} Random Points ===")
    
    for i in range(num_points):
        # Generate random point within bounds
        lon = random.uniform(bounds['minLon'], bounds['maxLon'])
        lat = random.uniform(bounds['minLat'], bounds['maxLat'])
        
        # Project with debug output
        x, y = projection.project(lon, lat, debug=True)
        print(f"Final projected coordinates: ({x:.2f}, {y:.2f})")
        print("-" * 50)

def generate_russia_map(country_borders: List[Dict], filename: str = "../frontend/public/conic_russia_map.svg"):
    """
    Generates an SVG file of Russia using a conic projection
    """
    print("\n=== Generating Russia Map ===")
    
    # Russia map configuration - optimized for Russia's geography
    config = {
        "width": 720,
        "height": 360,
        "scale": 1,
        "standardParallel1": 50,  # Russia spans a wide latitude range
        "standardParallel2": 70,  # Higher latitudes for northern regions
        "centerLat": 60,          # Center latitude in Russia
        "centerLon": 100,         # Center longitude in Russia
        "bounds": {
            "minLat": 40,         # Southern border regions
            "maxLat": 85,         # Northern regions including Arctic (increased from 80)
            "minLon": 20,         # Western border (includes some of Eastern Europe)
            "maxLon": 180         # Eastern border (Pacific coast)
        }
    }

    projection = ConicProjection(config)
    
    # Test with random points to debug the projection
    test_random_points(projection)

    print("\nGenerating SVG paths...")
    
    # First pass: project all coordinates to find the optimal scale factor
    all_projected_points = []
    countries_in_bounds = []
    
    # Define the visible map area (in projected coordinates)
    map_bounds = {
        "minX": 0,
        "maxX": config["width"],
        "minY": 0,
        "maxY": config["height"]
    }
    
    # Create expanded lat/lon bounds with 20-degree margin
    expanded_bounds = {
        "minLat": config['bounds']['minLat'] - 30,
        "maxLat": config['bounds']['maxLat'] + 5,
        "minLon": config['bounds']['minLon'] - 20,
        "maxLon": config['bounds']['maxLon'] + 20
    }
    
    print(f"\nUsing expanded bounds for filtering:")
    print(f"  Original: Lat [{config['bounds']['minLat']}, {config['bounds']['maxLat']}], Lon [{config['bounds']['minLon']}, {config['bounds']['maxLon']}]")
    print(f"  Expanded: Lat [{expanded_bounds['minLat']}, {expanded_bounds['maxLat']}], Lon [{expanded_bounds['minLon']}, {expanded_bounds['maxLon']}]")
    
    # First pass: identify countries with at least one point in expanded lat/lon bounds
    for country_data in country_borders:
        # Check if any point of this country is within expanded lat/lon bounds
        has_points_in_bounds = False
        country_projected_points = []
        
        for polygon in country_data['borders']:
            for lon, lat in polygon:
                # Check if this point is within expanded lat/lon bounds
                in_expanded_bounds = (
                    expanded_bounds['minLon'] <= lon <= expanded_bounds['maxLon'] and
                    expanded_bounds['minLat'] <= lat <= expanded_bounds['maxLat']
                )
                
                if in_expanded_bounds:
                    has_points_in_bounds = True
                    
                    # Project with scale factor of 1.0 for scale calculation
                    x, y = projection.project(lon, lat, scale_factor=1.0)
                    country_projected_points.append((x, y))
        
        # Only include countries with at least one point in expanded bounds
        if has_points_in_bounds:
            countries_in_bounds.append(country_data)
            # Only add Russia's points to the list used for scale calculation
            if country_data['country'] == "Russia":
                all_projected_points.extend(country_projected_points)
    
    # Calculate the optimal scale factor based on Russia's points only
    optimal_scale = 1.0
    offset_x = 0.0
    offset_y = 0.0
    
    if all_projected_points:
        print(f"\nCalculating scale factor based on Russia's points only ({len(all_projected_points)} points)")
        min_x = min(p[0] for p in all_projected_points)
        max_x = max(p[0] for p in all_projected_points)
        min_y = min(p[1] for p in all_projected_points)
        max_y = max(p[1] for p in all_projected_points)
        
        # Calculate width and height of the projected area
        proj_width = max_x - min_x
        proj_height = max_y - min_y
        
        # Calculate the center of the projected area
        proj_center_x = min_x + proj_width / 2
        proj_center_y = min_y + proj_height / 2
        
        # Calculate the offset needed to center the map
        offset_x = config["width"] / 2 - proj_center_x
        offset_y = config["height"] / 2 - proj_center_y
        
        print(f"Projection center: ({proj_center_x:.2f}, {proj_center_y:.2f})")
        print(f"Canvas center: ({config['width']/2:.2f}, {config['height']/2:.2f})")
        print(f"Centering offset: ({offset_x:.2f}, {offset_y:.2f})")
        
        # Calculate scale factors to fit within the SVG dimensions
        # Use a smaller margin to allow more space for Russia
        margin = 0.05  # Reverted to original margin
        scale_x = (config["width"] * (1 - 2 * margin)) / proj_width
        scale_y = (config["height"] * (1 - 2 * margin)) / proj_height
        
        # Use the smaller scale factor to maintain aspect ratio
        optimal_scale = min(scale_x, scale_y)  # Reverted to original scale calculation
        
        # Adjust vertical offset to move Russia down a bit
        offset_y += config["height"] * 0.15  # Move down by 15% of the height
        
        print(f"\nCalculated optimal scale factor: {optimal_scale:.4f}")
        print(f"Projected area: width={proj_width:.2f}, height={proj_height:.2f}")
        print(f"After scaling: width={proj_width * optimal_scale:.2f}, height={proj_height * optimal_scale:.2f}")
        print(f"Adjusted vertical offset: {offset_y:.2f}")
    else:
        print("\nWarning: No points in bounds to calculate optimal scale. Using default scale of 1.0")
    
    # SVG header with updated dimensions and viewBox, including projection data
    svg_content = [
        f'<svg width="{config["width"]}" height="{config["height"]}" viewBox="0 0 360 180" '
        f'data-scale="{optimal_scale:.6f}" data-offset-x="{offset_x:.2f}" data-offset-y="{offset_y:.2f}" '
        f'xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '  path { fill: #f0f0f0; stroke: #666; stroke-width: 0.1; }',
        '  path:hover { fill: #ddd; }',
        '  path.russia-path { stroke: rgb(255, 50, 50); stroke-width: 0.8; paint-order: stroke; stroke-linejoin: round; }',
        '</style>'
    ]
    
    # Separate countries into Russia and others
    russia_paths = []
    other_country_paths = []
    
    # Generate paths for each country using the optimal scale
    countries_included = 0
    total_points = 0
    
    for country_data in countries_in_bounds:  # Only process countries in expanded bounds
        country_name = country_data['country']
        country_points = 0
        
        # Generate paths for each polygon in the country
        country_paths = []
        for polygon in country_data['borders']:
            # Project coordinates with optimal scale
            projected_coords = []
            
            # First check if any point in this polygon is visible after projection
            any_point_visible = False
            
            # Process each line segment to handle clipping properly
            for i in range(len(polygon)):
                lon1, lat1 = polygon[i]
                lon2, lat2 = polygon[(i + 1) % len(polygon)]  # Wrap around to first point
                
                # Project both endpoints
                x1, y1 = projection.project(lon1, lat1, scale_factor=optimal_scale)
                x2, y2 = projection.project(lon2, lat2, scale_factor=optimal_scale)
                
                # Apply centering offset
                x1 += offset_x
                y1 += offset_y
                x2 += offset_x
                y2 += offset_y
                
                # Check if either endpoint is within the map bounds
                point1_visible = (0 <= x1 <= config["width"] and 0 <= y1 <= config["height"])
                point2_visible = (0 <= x2 <= config["width"] and 0 <= y2 <= config["height"])
                
                if point1_visible or point2_visible:
                    any_point_visible = True
                    
                    # Scale coordinates to fit the viewBox
                    scaled_x1 = x1 * (360 / config["width"])
                    scaled_y1 = y1 * (180 / config["height"])
                    
                    # Only add the point if it's not already the last point added
                    if not projected_coords or (scaled_x1, scaled_y1) != projected_coords[-1]:
                        projected_coords.append((scaled_x1, scaled_y1))
                        country_points += 1
                    
                    # Add the second point if it's different from the first
                    scaled_x2 = x2 * (360 / config["width"])
                    scaled_y2 = y2 * (180 / config["height"])
                    
                    if (scaled_x2, scaled_y2) != (scaled_x1, scaled_y1):
                        projected_coords.append((scaled_x2, scaled_y2))
                        country_points += 1
            
            # Skip polygons where no points are visible
            if not any_point_visible:
                continue
                
            if len(projected_coords) >= 3:  # Need at least 3 points for a valid polygon
                # Create SVG path
                path_data = "M " + " L ".join(f"{x},{y}" for x, y in projected_coords) + " Z"
                
                if country_name == "Russia":
                    russia_paths.append(f'<path d="{path_data}" class="russia-path" title="{country_name}"/>')
                else:
                    country_paths.append(f'<path d="{path_data}" title="{country_name}"/>')
        
        if country_name != "Russia":
            other_country_paths.extend(country_paths)
        
        if country_points > 0:
            countries_included += 1
            print(f"  {country_name}: {country_points} points")
            total_points += country_points
    
    # Add other countries first
    svg_content.extend(other_country_paths)
    
    # Then add Russia paths at the end so they appear on top
    svg_content.extend(russia_paths)
    
    print(f"\nSummary:")
    print(f"Countries included: {countries_included}")
    print(f"Total points rendered: {total_points}")
    print(f"Scale factor: {optimal_scale:.6f}")
    print(f"Offset X: {offset_x:.2f}, Offset Y: {offset_y:.2f}")
    
    # SVG footer
    svg_content.append('</svg>')
    
    # Write to file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg_content))
    print(f"\nSVG map saved as {filename}")

def main():
    # Load country border data
    country_borders = load_country_borders("simplified_country_borders.json")
    
    if country_borders:
        print("Generating Russia map with conic projection...")
        generate_russia_map(country_borders)
    else:
        print("Failed to load country border data")

if __name__ == "__main__":
    main() 