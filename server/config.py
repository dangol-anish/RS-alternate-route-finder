"""
Configuration settings for the route finding application.
"""

# Obstacle avoidance settings
OBSTACLE_RADIUS_DEFAULT = 0.1  # Default radius in kilometers
OBSTACLE_RADIUS_MIN = 0.01     # Minimum radius in kilometers
OBSTACLE_RADIUS_MAX = 1.0      # Maximum radius in kilometers

# Predefined obstacle radius options
OBSTACLE_RADIUS_OPTIONS = {
    'tight': 0.05,      # 50 meters - tight avoidance
    'standard': 0.1,    # 100 meters - standard avoidance
    'wide': 0.2,        # 200 meters - wide avoidance
    'very_wide': 0.5,   # 500 meters - very wide avoidance
}

# Pathfinding settings
MAX_ITERATIONS_MULTIPLIER = 2  # Max iterations = nodes * multiplier
NODE_SEARCH_RADIUS = 0.01      # Degrees for finding nearest nodes
CACHE_TTL = 300                # Cache time-to-live in seconds

# Performance settings
ENABLE_SPATIAL_INDEXING = True
ENABLE_PATH_CACHING = True
ENABLE_OBSTACLE_CACHING = True

def validate_obstacle_radius(radius):
    """Validate obstacle radius is within acceptable range."""
    if not isinstance(radius, (int, float)):
        raise ValueError("Obstacle radius must be a number")
    
    if radius < OBSTACLE_RADIUS_MIN or radius > OBSTACLE_RADIUS_MAX:
        raise ValueError(f"Obstacle radius must be between {OBSTACLE_RADIUS_MIN} and {OBSTACLE_RADIUS_MAX} km")
    
    return float(radius)

def get_obstacle_radius_preset(preset_name):
    """Get obstacle radius from preset name."""
    if preset_name not in OBSTACLE_RADIUS_OPTIONS:
        raise ValueError(f"Unknown preset: {preset_name}. Available: {list(OBSTACLE_RADIUS_OPTIONS.keys())}")
    
    return OBSTACLE_RADIUS_OPTIONS[preset_name] 