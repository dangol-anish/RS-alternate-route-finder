# pathfinding.py
import heapq
from utils import heuristic
from cache_utils import get_cache_key, get_cached_path, cache_path

def bidirectional_astar(graph, source, destination, obstacles, obstacle_radius=0.1):
    """Optimized Bidirectional A* Algorithm with spatial indexing and configurable obstacle avoidance."""

    # 1. Check cache first
    cache_key = get_cache_key(source, destination, obstacles, obstacle_radius)
    cached_result = get_cached_path(cache_key)
    if cached_result:
        print(f"Cache hit for {source}-{destination}")
        return cached_result.get('path'), cached_result.get('explored_edges')

    print(f"Cache miss for {source}-{destination}")
    
    # 2. Early termination checks using spatial index (O(1))
    from spatial_index import get_spatial_index
    spatial_index = get_spatial_index()
    
    # CRITICAL FIX: Update spatial index with obstacles before pathfinding
    spatial_index.update_obstacles(obstacles)
    
    # Set obstacle radius if provided
    if obstacle_radius != spatial_index.obstacle_radius:
        spatial_index.set_obstacle_radius(obstacle_radius)
    
    if not spatial_index.node_exists(source) or not spatial_index.node_exists(destination):
        return None, []
    
    # Check if source or destination are obstacles or near obstacles
    if (spatial_index.is_obstacle(source) or spatial_index.is_obstacle(destination) or
        spatial_index.is_near_obstacle(source) or spatial_index.is_near_obstacle(destination)):
        return None, []

    # 3. Use sparse data structures instead of full dictionaries
    open_set = []
    heapq.heappush(open_set, (0, source, 'forward'))
    heapq.heappush(open_set, (0, destination, 'backward'))
    
    came_from = {'forward': {}, 'backward': {}}
    g_score = {'forward': {}, 'backward': {}}  # Sparse storage
    f_score = {'forward': {}, 'backward': {}}  # Sparse storage
    
    # Initialize starting nodes
    g_score['forward'][source] = 0
    g_score['backward'][destination] = 0
    
    f_score['forward'][source] = heuristic(source, destination, graph, obstacles)
    f_score['backward'][destination] = heuristic(destination, source, graph, obstacles)
    
    explored_edges = []
    meeting_node = None
    max_iterations = len(graph.nodes) * 2  # Prevent infinite loops
    iteration_count = 0
    
    while open_set and iteration_count < max_iterations:
        iteration_count += 1
        
        # Get node with lowest f-score
        _, current, direction = heapq.heappop(open_set)
        opposite = 'backward' if direction == 'forward' else 'forward'
        
        # Check if we found a meeting point
        if current in came_from[opposite]:
            meeting_node = current
            break
        
        # Get current g_score (default to infinity if not set)
        current_g = g_score[direction].get(current, float('inf'))
        
        # Explore neighbors using spatial index (O(1) for first neighbor)
        neighbors = spatial_index.get_neighbors(current)
        
        for neighbor in neighbors:
            # O(1) obstacle check using spatial index
            if spatial_index.is_obstacle(neighbor):
                continue
            
            # Check if neighbor is within obstacle radius
            if spatial_index.is_near_obstacle(neighbor):
                continue
            
            # Precise edge proximity check
            if spatial_index.is_edge_near_obstacle(current, neighbor):
                continue
            
            # O(1) edge data access using spatial index
            edge_data = spatial_index.get_edge_data(current, neighbor)
            if not edge_data:
                continue
            
            # Get edge weight
            edge_weight = edge_data.get('length', float('inf'))
            if edge_weight == float('inf'):
                continue

            # Calculate tentative g_score
            tentative_g_score = current_g + edge_weight
            
            # Check if this path is better
            neighbor_g = g_score[direction].get(neighbor, float('inf'))
            if tentative_g_score < neighbor_g:
                came_from[direction][neighbor] = current
                g_score[direction][neighbor] = tentative_g_score
                
                # Calculate f_score
                target = destination if direction == 'forward' else source
                f_score[direction][neighbor] = tentative_g_score + heuristic(neighbor, target, graph, obstacles)
                
                heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))
                explored_edges.append((current, neighbor))
    
    # Check if we found a path
    if meeting_node is None:
        return None, explored_edges
    
    # Reconstruct path
    path = []
    
    # Reconstruct forward path
    node = meeting_node
    while node in came_from['forward']:
        path.append(node)
        node = came_from['forward'][node]
    path.append(source)
    path.reverse()

    # Reconstruct backward path
    node = meeting_node
    while node in came_from['backward']:
        node = came_from['backward'][node]
        path.append(node)
    
    # Cache the result
    result_to_cache = {'path': path, 'explored_edges': explored_edges}
    cache_path(cache_key, result_to_cache)
    
    return path, explored_edges
