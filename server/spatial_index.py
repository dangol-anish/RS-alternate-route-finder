"""
Spatial Indexing System for Route Finding

This module implements spatial indexing to replace linear search operations
with O(1) lookups, dramatically improving pathfinding performance.
"""

import numpy as np
from scipy.spatial import cKDTree
from collections import defaultdict
import time
from shapely.geometry import LineString, Point


class SpatialIndex:
    """Spatial indexing system for efficient node and edge lookups."""
    
    def __init__(self, graph, obstacle_radius=0.1):
        """Initialize spatial index from NetworkX graph."""
        self.graph = graph
        self.node_coords = {}
        self.node_tree = None
        self.edge_index = defaultdict(dict)
        self.obstacle_set = set()
        self.obstacle_radius = obstacle_radius  # km
        self.obstacle_coords = {}  # Store obstacle coordinates for radius checking
        
        # Build spatial index
        self._build_node_index()
        self._build_edge_index()
        
        print(f"Spatial index built: {len(self.node_coords)} nodes, {len(self.edge_index)} edges")
        print(f"Obstacle radius: {obstacle_radius} km")
    
    def _build_node_index(self):
        """Build spatial index for nodes."""
        coords = []
        node_ids = []
        
        for node_id, data in self.graph.nodes(data=True):
            lat, lon = data['y'], data['x']
            coords.append([lat, lon])
            node_ids.append(node_id)
            self.node_coords[node_id] = (lat, lon)
        
        # Build KD-tree for spatial queries
        if coords:
            self.node_tree = cKDTree(np.array(coords))
            self.node_ids = np.array(node_ids)
    
    def _build_edge_index(self):
        """Build index for edge data access."""
        for u, v, data in self.graph.edges(data=True):
            if u not in self.edge_index:
                self.edge_index[u] = {}
            self.edge_index[u][v] = data
    
    def find_nearest_node(self, lat, lon, max_distance=0.01):
        """Find nearest node to given coordinates (O(log n))."""
        if self.node_tree is None:
            return None
        
        # Query KD-tree
        distance, index = self.node_tree.query([lat, lon])
        
        if distance <= max_distance:
            return int(self.node_ids[index])
        return None
    
    def get_node_coordinates(self, node_id):
        """Get node coordinates (O(1))."""
        return self.node_coords.get(node_id)
    
    def node_exists(self, node_id):
        """Check if node exists (O(1))."""
        return node_id in self.node_coords
    
    def get_neighbors(self, node_id):
        """Get neighbors of a node (O(1) for first neighbor, O(deg) for all)."""
        if node_id not in self.graph:
            return []
        return list(self.graph.neighbors(node_id))
    
    def get_edge_data(self, u, v):
        """Get edge data (O(1))."""
        return self.edge_index.get(u, {}).get(v)
    
    def is_obstacle(self, node_id):
        """Check if node is an obstacle (O(1))."""
        return node_id in self.obstacle_set
    
    def is_near_obstacle(self, node_id):
        """Check if node is within obstacle radius (O(m) where m = obstacles)."""
        if not self.obstacle_coords:
            return False
        
        node_coords = self.get_node_coordinates(node_id)
        if not node_coords:
            return False
        
        node_lat, node_lon = node_coords
        
        # Check distance to all obstacles
        for obs_lat, obs_lon in self.obstacle_coords.values():
            distance = self._haversine_distance(node_lat, node_lon, obs_lat, obs_lon)
            if distance < self.obstacle_radius:
                return True
        
        return False
    
    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate haversine distance between two points (O(1))."""
        from utils import haversine
        return haversine(lat1, lon1, lat2, lon2)
    
    def update_obstacles(self, obstacles):
        """Update obstacle set and coordinates (O(1) per obstacle)."""
        self.obstacle_set = set(obstacles)
        
        # Update obstacle coordinates for radius checking
        self.obstacle_coords = {}
        for obstacle_id in obstacles:
            if obstacle_id in self.node_coords:
                self.obstacle_coords[obstacle_id] = self.node_coords[obstacle_id]
    
    def set_obstacle_radius(self, radius_km):
        """Set the obstacle avoidance radius in kilometers."""
        self.obstacle_radius = radius_km
        print(f"Obstacle radius updated to {radius_km} km")
    
    def get_nodes_in_radius(self, lat, lon, radius=0.01):
        """Get all nodes within radius (O(log n + k) where k = nodes in radius)."""
        if self.node_tree is None:
            return []
        
        # Query KD-tree for nodes within radius
        indices = self.node_tree.query_ball_point([lat, lon], radius)
        return [int(self.node_ids[i]) for i in indices]
    
    def is_edge_near_obstacle(self, u, v):
        """Check if edge (u, v) is within obstacle radius of any obstacle (precise check)."""
        u_coords = self.get_node_coordinates(u)
        v_coords = self.get_node_coordinates(v)
        if not u_coords or not v_coords or not self.obstacle_coords:
            return False
        edge_line = LineString([(u_coords[1], u_coords[0]), (v_coords[1], v_coords[0])])  # (lon, lat)
        for obs_lat, obs_lon in self.obstacle_coords.values():
            obstacle_point = Point(obs_lon, obs_lat)
            # Distance in degrees, convert to km using haversine for small distances
            # Approximate: 1 deg lat ~ 111 km, 1 deg lon ~ 111 km * cos(lat)
            # We'll use a buffer in degrees for the radius
            buffer_deg = self.obstacle_radius / 111.0
            if edge_line.distance(obstacle_point) < buffer_deg:
                return True
        return False


class OptimizedPathfinding:
    """Optimized pathfinding using spatial indexing."""
    
    def __init__(self, graph):
        """Initialize with spatial index."""
        self.graph = graph
        self.spatial_index = SpatialIndex(graph)
    
    def find_path(self, source_lat, source_lon, dest_lat, dest_lon, obstacles=None):
        """Find path between coordinates using spatial indexing."""
        start_time = time.time()
        
        # Find nearest nodes (O(log n))
        source_node = self.spatial_index.find_nearest_node(source_lat, source_lon)
        dest_node = self.spatial_index.find_nearest_node(dest_lat, dest_lon)
        
        if source_node is None or dest_node is None:
            return None, f"Could not find nodes near coordinates"
        
        # Update obstacles
        if obstacles is not None:
            self.spatial_index.update_obstacles(obstacles)
        
        # Use optimized pathfinding
        path, explored = self._bidirectional_astar_optimized(source_node, dest_node)
        
        end_time = time.time()
        print(f"Pathfinding completed in {end_time - start_time:.3f} seconds")
        
        return path, explored
    
    def _bidirectional_astar_optimized(self, source, destination):
        """Optimized bidirectional A* using spatial indexing."""
        import heapq
        
        # Early termination with O(1) checks
        if not self.spatial_index.node_exists(source) or not self.spatial_index.node_exists(destination):
            return None, []
        
        if self.spatial_index.is_obstacle(source) or self.spatial_index.is_obstacle(destination):
            return None, []
        
        # Initialize with sparse data structures
        open_set = []
        heapq.heappush(open_set, (0, source, 'forward'))
        heapq.heappush(open_set, (0, destination, 'backward'))
        
        came_from = {'forward': {}, 'backward': {}}
        g_score = {'forward': {}, 'backward': {}}
        f_score = {'forward': {}, 'backward': {}}
        
        # Initialize starting nodes
        g_score['forward'][source] = 0
        g_score['backward'][destination] = 0
        
        # Use simple heuristic (O(1))
        f_score['forward'][source] = self._simple_heuristic(source, destination)
        f_score['backward'][destination] = self._simple_heuristic(destination, source)
        
        explored_edges = []
        meeting_node = None
        max_iterations = len(self.graph.nodes) * 2
        iteration_count = 0
        
        while open_set and iteration_count < max_iterations:
            iteration_count += 1
            
            _, current, direction = heapq.heappop(open_set)
            opposite = 'backward' if direction == 'forward' else 'forward'
            
            # Check meeting point
            if current in came_from[opposite]:
                meeting_node = current
                break
            
            current_g = g_score[direction].get(current, float('inf'))
            
            # Get neighbors using spatial index (O(1) for first neighbor)
            neighbors = self.spatial_index.get_neighbors(current)
            
            for neighbor in neighbors:
                # O(1) obstacle check
                if self.spatial_index.is_obstacle(neighbor):
                    continue
                
                # O(1) edge data access
                edge_data = self.spatial_index.get_edge_data(current, neighbor)
                if not edge_data:
                    continue
                
                edge_weight = edge_data.get('length', float('inf'))
                if edge_weight == float('inf'):
                    continue
                
                tentative_g_score = current_g + edge_weight
                neighbor_g = g_score[direction].get(neighbor, float('inf'))
                
                if tentative_g_score < neighbor_g:
                    came_from[direction][neighbor] = current
                    g_score[direction][neighbor] = tentative_g_score
                    
                    target = destination if direction == 'forward' else source
                    f_score[direction][neighbor] = tentative_g_score + self._simple_heuristic(neighbor, target)
                    
                    heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))
                    explored_edges.append((current, neighbor))
        
        if meeting_node is None:
            return None, explored_edges
        
        # Reconstruct path
        path = self._reconstruct_path(came_from, meeting_node, source, destination)
        return path, explored_edges
    
    def _simple_heuristic(self, node1, node2):
        """Simple haversine heuristic (O(1))."""
        from utils import haversine
        
        coords1 = self.spatial_index.get_node_coordinates(node1)
        coords2 = self.spatial_index.get_node_coordinates(node2)
        
        if coords1 and coords2:
            return haversine(coords1[0], coords1[1], coords2[0], coords2[1])
        return float('inf')
    
    def _reconstruct_path(self, came_from, meeting_node, source, destination):
        """Reconstruct path from meeting point."""
        path = []
        
        # Forward path
        node = meeting_node
        while node in came_from['forward']:
            path.append(node)
            node = came_from['forward'][node]
        path.append(source)
        path.reverse()
        
        # Backward path
        node = meeting_node
        while node in came_from['backward']:
            node = came_from['backward'][node]
            path.append(node)
        
        return path


# Global spatial index instance
spatial_index = None
optimized_pathfinding = None


def initialize_spatial_index(graph):
    """Initialize global spatial index."""
    global spatial_index, optimized_pathfinding
    spatial_index = SpatialIndex(graph)
    optimized_pathfinding = OptimizedPathfinding(graph)
    return spatial_index, optimized_pathfinding


def get_spatial_index():
    """Get global spatial index instance."""
    return spatial_index


def get_optimized_pathfinding():
    """Get global optimized pathfinding instance."""
    return optimized_pathfinding 