# pathfinding.py
import heapq
from utils import heuristic

def bidirectional_astar(graph, source, destination, obstacles):
    """Bidirectional A* Algorithm with obstacle avoidance."""

    # first check if the source or destination nodes lies in the obstacle
    if source in obstacles or destination in obstacles:
        return None, []

    #initialize a priority queue to explore in forward or backward direction
    #initial priority is set to 0 (f-score)
    #prioritized by f-score (estimated cost to reach the goal)

    #open set is a priority queue that holds nodes yet to be explored
    #prioritized by their f-score 
    open_set = []
    heapq.heappush(open_set, (0, source, 'forward'))
    heapq.heappush(open_set, (0, destination, 'backward'))
    
    #where the last node is
    came_from = {'forward': {}, 'backward': {}}

    #stores the known cost to reach each next node, initially inifinity
    g_score = {'forward': {node: float('inf') for node in graph.nodes},
               'backward': {node: float('inf') for node in graph.nodes}}
    #stores the estimated cost to reach the destination node
    f_score = {'forward': {node: float('inf') for node in graph.nodes},
               'backward': {node: float('inf') for node in graph.nodes}}
    
    #steps the score for starting nodes
    g_score['forward'][source] = 0
    g_score['backward'][destination] = 0
    
    f_score['forward'][source] = heuristic(source, destination, graph, obstacles)
    f_score['backward'][destination] = heuristic(destination, source, graph, obstacles)
    
    #nodes that have already been explored and the meeting point
    explored_edges = []
    meeting_node = None
    
    while open_set:
        #pops the node with the lowest f-score (the most probable next node)
        _, current, direction = heapq.heappop(open_set)
        opposite = 'backward' if direction == 'forward' else 'forward'
        
        #if the node from forward is the same as from backward
        if current in came_from[opposite]:
            meeting_node = current
            break
        
        # we check if the neighbouring nodes are an obstacle
        for neighbor in graph.neighbors(current):
            if neighbor in obstacles or current in obstacles:  # Ignore obstacles
                continue
            
            #if the edge between these nodes doesnt exist, we skip this node
            edge_data = graph.get_edge_data(current, neighbor)
            if not edge_data:
                continue
            
            #consider the minimum edge weight
            edge_weight = min(edge.get('length', float('inf')) for edge in edge_data.values())
            if edge_weight == float('inf'):
                continue

            #cost to reach the neighbour
            #if the tentative g-score is less than known g-score then update g-score
            tentative_g_score = g_score[direction][current] + edge_weight
            
            if tentative_g_score < g_score[direction][neighbor]:
                came_from[direction][neighbor] = current
                g_score[direction][neighbor] = tentative_g_score
                f_score[direction][neighbor] = tentative_g_score + heuristic(
                    neighbor, destination if direction == 'forward' else source, graph, obstacles
                )
                heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))
                explored_edges.append((current, neighbor))
    #failed to meet the path
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
