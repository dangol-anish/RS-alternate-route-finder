from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import osmnx as ox
import networkx as nx
import heapq

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Load road network graph
place_name = "Kathmandu, Nepal"
graph = ox.graph_from_place(place_name, network_type="drive")
nodes, edges = ox.graph_to_gdfs(graph)

# Set to store obstacle nodes
obstacles = set()

@app.route('/')
def index():
    return render_template('map.html')

@app.route('/edges')
def get_edges():
    return jsonify(edges.to_json())

@app.route('/nodes')
def get_nodes():
    return jsonify(nodes.to_json())

@app.route('/obstacles', methods=['POST'])
def set_obstacles():
    global obstacles
    data = request.get_json()
    
    try:
        received_obstacles = {int(node) for node in data.get("obstacles", [])}  # Convert to integers
        valid_obstacles = {node for node in received_obstacles if node in graph.nodes}
        
        obstacles = valid_obstacles  # Only store valid obstacles
        print("Updated Obstacles:", obstacles)  # Debugging output
        
        return jsonify({"status": "Obstacles updated", "valid_obstacles": list(valid_obstacles)})
    
    except ValueError:
        return jsonify({"error": "Obstacle node IDs must be integers"}), 400


def heuristic(node1, node2):
    lat1, lon1 = graph.nodes[node1]['y'], graph.nodes[node1]['x']
    lat2, lon2 = graph.nodes[node2]['y'], graph.nodes[node2]['x']
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5

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
    
    f_score['forward'][source] = heuristic(source, destination)
    f_score['backward'][destination] = heuristic(destination, source)
    
    explored_edges = []
    meeting_node = None
    
    while open_set:
        _, current, direction = heapq.heappop(open_set)
        opposite = 'backward' if direction == 'forward' else 'forward'
        
        if current in came_from[opposite]:
            meeting_node = current
            break
        
        for neighbor in graph.neighbors(current):
            if current in obstacles or neighbor in obstacles:
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
                    neighbor, destination if direction == 'forward' else source
                )
                heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))
                explored_edges.append((current, neighbor))
    
    if meeting_node is None:
        return None, explored_edges
    
    path = []
    node = meeting_node
    while node in came_from['forward']:
        if node in obstacles:
            return None, explored_edges
        path.append(node)
        node = came_from['forward'][node]
    path.append(source)
    path.reverse()
    
    node = meeting_node
    while node in came_from['backward']:
        if node in obstacles:
            return None, explored_edges
        node = came_from['backward'][node]
        path.append(node)
    
    return path, explored_edges

@app.route('/shortest_path', methods=['POST'])
def shortest_path():
    data = request.get_json()
    print("Received Data:", data)
    
    if not data or 'source' not in data or 'destination' not in data:
        return jsonify({'error': 'Invalid input data'}), 400
    
    try:
        source_node = int(data['source'])
        destination_node = int(data['destination'])
        
        print("Processed Source Node:", source_node)
        print("Processed Destination Node:", destination_node)
        
        if source_node not in graph.nodes or destination_node not in graph.nodes:
            return jsonify({'error': f"Invalid nodes: {source_node}, {destination_node}"}), 400
        
        path, explored_edges = bidirectional_astar(graph, source_node, destination_node, obstacles)
        if path is None:
            return jsonify({'error': 'No path found'}), 400
        
        path_coordinates = [(graph.nodes[node]['y'], graph.nodes[node]['x']) for node in path]
        explored_coordinates = [[(graph.nodes[u]['y'], graph.nodes[u]['x']),
                                 (graph.nodes[v]['y'], graph.nodes[v]['x'])] for u, v in explored_edges]
        
        return jsonify({'path': path_coordinates, 'explored': explored_coordinates})
    
    except ValueError:
        return jsonify({'error': 'Invalid node IDs, must be integers'}), 400
    except Exception as e:
        import traceback
        print("Exception:", traceback.format_exc())
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")