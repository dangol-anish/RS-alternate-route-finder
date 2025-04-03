# utils.py
import math

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance between two GPS points using the Haversine formula."""
    R = 6371  # Earth's radius in km

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c  # Distance in kilometers

def heuristic(node1, node2, graph, obstacles):
    """Haversine heuristic for GPS-based A* search, with obstacle penalty."""
    lat1, lon1 = graph.nodes[node1]['y'], graph.nodes[node1]['x']
    lat2, lon2 = graph.nodes[node2]['y'], graph.nodes[node2]['x']
    
    base_heuristic = haversine(lat1, lon1, lat2, lon2)
    
    # Add penalty for nearby obstacles
    penalty = 0
    for obs in obstacles:
        if obs not in graph.nodes:
            continue  # Skip missing obstacle nodes

        obs_lat, obs_lon = graph.nodes[obs]['y'], graph.nodes[obs]['x']
        dist_to_obstacle = haversine(lat1, lon1, obs_lat, obs_lon)

        if dist_to_obstacle < 0.1:  # If within 100 meters, add penalty
            penalty += 10 / dist_to_obstacle  # Higher penalty for closer obstacles

    return base_heuristic + penalty
