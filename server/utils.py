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
    """Optimized Haversine heuristic for GPS-based A* search."""
    lat1, lon1 = graph.nodes[node1]['y'], graph.nodes[node1]['x']
    lat2, lon2 = graph.nodes[node2]['y'], graph.nodes[node2]['x']
    
    # Use simple haversine distance without obstacle penalty
    # Obstacle avoidance is handled by the main algorithm, not the heuristic
    return haversine(lat1, lon1, lat2, lon2)
