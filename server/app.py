from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import osmnx as ox
import heapq

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

# Load Kathmandu's road network as a graph
place_name = "Kathmandu, Nepal"
graph = ox.graph_from_place(place_name, network_type="drive")

# Convert graph to GeoDataFrames
nodes, edges = ox.graph_to_gdfs(graph)

@app.route('/')
def index():
    return render_template('map.html')

@app.route('/edges')
def get_edges():
    return jsonify(edges.to_json())

@app.route('/nodes')
def get_nodes():
    return jsonify(nodes.to_json())

def heuristic(node1, node2):
    lat1, lon1 = graph.nodes[node1]['y'], graph.nodes[node1]['x']
    lat2, lon2 = graph.nodes[node2]['y'], graph.nodes[node2]['x']
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5

def bidirectional_astar(graph, source, destination):
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
            edge_weight = graph[current][neighbor][0]['length']
            tentative_g_score = g_score[direction][current] + edge_weight
            
            if tentative_g_score < g_score[direction][neighbor]:
                came_from[direction][neighbor] = current
                g_score[direction][neighbor] = tentative_g_score
                f_score[direction][neighbor] = tentative_g_score + heuristic(neighbor, destination if direction == 'forward' else source)
                heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))
                explored_edges.append((current, neighbor))
    
    if meeting_node is None:
        return None, explored_edges
    
    # Reconstruct path
    path = []
    node = meeting_node
    while node in came_from['forward']:
        path.append(node)
        node = came_from['forward'][node]
    path.append(source)
    path.reverse()
    
    node = meeting_node
    while node in came_from['backward']:
        node = came_from['backward'][node]
        path.append(node)
    
    return path, explored_edges

@app.route('/shortest_path', methods=['POST'])
def shortest_path():

    print("\n===== Received Request =====")
    print("Headers:", request.headers)
    print("Raw Data:", request.data) 
    data = request.get_json()

    if not data:
        print("No data received")  # Debug log
        return jsonify({'error': 'No data received'}), 400

    print("Request data:", data)

    
    source_node = int(data['source'])
    destination_node = int(data['destination'])

    print(source_node)
    print(destination_node)

    try:
        path, explored_edges = bidirectional_astar(graph, source_node, destination_node)

        if path is None:
            return jsonify({'error': 'No path found'}), 400

        path_coordinates = [(graph.nodes[node]['y'], graph.nodes[node]['x']) for node in path]
        explored_coordinates = [[(graph.nodes[u]['y'], graph.nodes[u]['x']), (graph.nodes[v]['y'], graph.nodes[v]['x'])] for u, v in explored_edges]

        return jsonify({'path': path_coordinates, 'explored': explored_coordinates})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
