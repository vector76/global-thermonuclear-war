import math
from datetime import datetime, timedelta, UTC
from typing import Dict, Tuple, TypedDict
import random

class LaunchResult(TypedDict):
    launch_latitude: float
    launch_longitude: float
    impact_time: datetime

EARTH_DIAMETER_KM = 12756  # Earth's diameter in kilometers
MISSILE_SPEED_KM_S = 7.8   # Missile speed in kilometers per second
MIN_DISTANCE_KM = 6000     # Minimum launch distance in kilometers
MAX_DISTANCE_KM = 12000    # Maximum launch distance in kilometers
MAX_ATTEMPTS = 5           # Maximum attempts to find a suitable launch point

def calculate_great_circle_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth's surface.
    Uses the haversine formula assuming a spherical Earth.
    
    Args:
        lat1, lon1: Coordinates of first point in degrees
        lat2, lon2: Coordinates of second point in degrees
        
    Returns:
        Distance in kilometers
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Calculate distance using Earth's diameter
    return c * (EARTH_DIAMETER_KM / 2)

def random_point_on_sphere() -> Tuple[float, float]:
    """
    Generate a random point on the surface of a unit sphere,
    then convert to latitude/longitude.
    
    Returns:
        Tuple of (latitude, longitude) in degrees
    """
    # Generate random point using spherical coordinates
    u = random.random()  # Random value 0 to 1
    v = random.random()  # Random value 0 to 1
    
    # Convert to spherical coordinates
    theta = 2 * math.pi * u  # Azimuthal angle (longitude)
    phi = math.acos(2 * v - 1)  # Polar angle
    
    # Convert to latitude/longitude
    lat = 90 - math.degrees(phi)  # Convert polar angle to latitude
    lon = math.degrees(theta) - 180  # Convert azimuthal angle to longitude
    
    return lat, lon

def calculate_launch_point(
    target_latitude: float,
    target_longitude: float,
    launch_time: datetime
) -> LaunchResult:
    """
    Calculate a suitable launch point and impact time for a missile.
    The launch point will be between MIN_DISTANCE_KM and MAX_DISTANCE_KM from the target.
    
    Args:
        target_latitude: Target latitude in degrees
        target_longitude: Target longitude in degrees
        launch_time: Time of launch in UTC
        
    Returns:
        Dictionary containing launch coordinates and impact time
    """
    best_distance = float('inf')
    best_point = None
    
    # Try up to MAX_ATTEMPTS times to find a suitable launch point
    for _ in range(MAX_ATTEMPTS):
        # Generate random point on sphere
        lat, lon = random_point_on_sphere()
        
        # Calculate distance to target
        distance = calculate_great_circle_distance(
            lat, lon,
            target_latitude, target_longitude
        )
        
        # If this point is within our desired range, use it
        if MIN_DISTANCE_KM <= distance <= MAX_DISTANCE_KM:
            best_point = (lat, lon)
            best_distance = distance
            break
            
        # If we haven't found a point in range yet, keep track of the closest one
        # that we've found (in case we need to use it after MAX_ATTEMPTS)
        if abs(distance - MIN_DISTANCE_KM) < abs(best_distance - MIN_DISTANCE_KM):
            best_point = (lat, lon)
            best_distance = distance
    
    # Calculate flight time based on distance
    flight_time_seconds = best_distance / MISSILE_SPEED_KM_S
    impact_time = launch_time + timedelta(seconds=flight_time_seconds)
    
    return {
        "launch_latitude": best_point[0],
        "launch_longitude": best_point[1],
        "impact_time": impact_time
    } 