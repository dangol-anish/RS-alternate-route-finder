import os
import json
import hashlib

CACHE_DIR = os.path.join(os.path.dirname(__file__), 'cache')
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def get_cache_key(source, destination, obstacles):
    """Creates a unique hash for a given pathfinding request."""
    # Convert obstacles set to a sorted tuple to ensure consistent ordering
    obstacle_tuple = tuple(sorted(list(obstacles)))
    
    # Create a string representation of the request
    key_string = f"{source}-{destination}-{obstacle_tuple}"
    
    # Return a SHA256 hash of the string
    return hashlib.sha256(key_string.encode()).hexdigest()

def get_cached_path(key):
    """Retrieves a cached path if it exists."""
    cache_file = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r') as f:
                return json.load(f)
        except (IOError, json.JSONDecodeError):
            return None
    return None

def cache_path(key, path_data):
    """Saves path data to the cache."""
    cache_file = os.path.join(CACHE_DIR, f"{key}.json")
    try:
        with open(cache_file, 'w') as f:
            json.dump(path_data, f)
    except IOError:
        # Handle cases where file can't be written
        pass 