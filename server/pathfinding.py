# pathfinding.py
import heapq
from utils import heuristic

def bidirectional_astar(graph, source, destination, obstacles):
    """Bidirectional A* Algorithm with obstacle avoidance."""
    if source in obstacles or destination in obstacles:
        return None, []

    open_set = []
    heapq.heappush(open_set, (0, source, 'forward'))
    heapq.heappush(open_set, (0, destination, 'backward'))
    
    came_from = {'forward': {}, 'backward': {}}
    g_score = {'forward': {node: float('inf') for node in graph.nodes},
               'backward': {node: float('inf') for node in graph.nodes}}
    f_score = {'forward': {node: float('inf') for node in graph.nodes},
               'backward': {node: float('inf') for node in graph.nodes}}
    
    g_score['forward'][source] = 0
    g_score['backward'][destination] = 0
    
    f_score['forward'][source] = heuristic(source, destination, graph, obstacles)
    f_score['backward'][destination] = heuristic(destination, source, graph, obstacles)
    
    explored_edges = []
    meeting_node = None
    
    while open_set:
        _, current, direction = heapq.heappop(open_set)
        opposite = 'backward' if direction == 'forward' else 'forward'
        
        if current in came_from[opposite]:
            meeting_node = current
            break
        
        for neighbor in graph.neighbors(current):
            if neighbor in obstacles or current in obstacles:  # Ignore obstacles
                continue
            
            edge_data = graph.get_edge_data(current, neighbor)
            if not edge_data:
                continue
            
            edge_weight = min(edge.get('length', float('inf')) for edge in edge_data.values())
            if edge_weight == float('inf'):
                continue

            tentative_g_score = g_score[direction][current] + edge_weight
            
            if tentative_g_score < g_score[direction][neighbor]:
                came_from[direction][neighbor] = current
                g_score[direction][neighbor] = tentative_g_score
                f_score[direction][neighbor] = tentative_g_score + heuristic(
                    neighbor, destination if direction == 'forward' else source, graph, obstacles
                )
                heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))
                explored_edges.append((current, neighbor))
    
    if meeting_node is None:
        return None, explored_edges
    
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
    
    return path, explored_edges
