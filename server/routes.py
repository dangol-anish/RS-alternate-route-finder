from dotenv import load_dotenv
load_dotenv()

from flask import Blueprint, jsonify, request, render_template
from pathfinding import bidirectional_astar
from utils import haversine, heuristic
import os
from supabase import create_client, Client
from flask import jsonify

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Define a Blueprint to keep routes separate
main_routes = Blueprint('main', __name__)

# Load road network graph
import osmnx as ox
place_names = ["Kathmandu, Nepal", "Lalitpur, Nepal"]
graph = ox.graph_from_place(place_names, network_type="all")

nodes, edges = ox.graph_to_gdfs(graph)

# Set to store obstacle nodes
obstacles = set()

@main_routes.route('/')
def index():
    return render_template('map.html')

@main_routes.route('/edges')
def get_edges():
    return jsonify(edges.to_json())

@main_routes.route('/nodes')
def get_nodes():
    return jsonify(nodes.to_json())

@main_routes.route('/obstacles', methods=['POST'])
def set_obstacles():
    global obstacles
    data = request.get_json()
    
    try:
        received_obstacles = {int(node) for node in data.get("obstacles", [])}  # Convert to integers
        valid_obstacles = {node for node in received_obstacles if node in graph.nodes}
        
        obstacles = valid_obstacles  # Only store valid obstacles
        
        return jsonify({"status": "Obstacles updated", "valid_obstacles": list(valid_obstacles)})
    
    except ValueError:
        return jsonify({"error": "Obstacle node IDs must be integers"}), 400

@main_routes.route('/shortest_path', methods=['POST'])
def shortest_path():
    data = request.get_json()
    
    if not data or 'source' not in data or 'destination' not in data:
        return jsonify({'error': 'Invalid input data'}), 400

    try:
        source_node = int(data['source'])
        destination_node = int(data['destination'])

        if source_node not in graph.nodes or destination_node not in graph.nodes:
            return jsonify({'error': f"Invalid nodes: {source_node}, {destination_node}"}), 400

        path, explored_edges = bidirectional_astar(graph, source_node, destination_node, obstacles)
        if path is None:
            return jsonify({'error': 'No path found'}), 400
        
        path_coordinates = []
        for u, v in zip(path[:-1], path[1:]):
            edge_data = graph.get_edge_data(u, v)
            if edge_data:
                edge_info = edge_data[0]
                if 'geometry' in edge_info:
                    path_coordinates.extend([(lat, lon) for lon, lat in edge_info['geometry'].coords])
                else:
                    path_coordinates.append((graph.nodes[u]['y'], graph.nodes[u]['x']))
                    path_coordinates.append((graph.nodes[v]['y'], graph.nodes[v]['x']))
        
        explored_coordinates = []   
        for u, v in explored_edges:
            edge_data = graph.get_edge_data(u, v)
            if edge_data:
                edge_info = edge_data[0]
                if 'geometry' in edge_info:
                    explored_coordinates.append([(lat, lon) for lon, lat in edge_info['geometry'].coords])
                else:
                    explored_coordinates.append([(graph.nodes[u]['y'], graph.nodes[u]['x']),
                                                 (graph.nodes[v]['y'], graph.nodes[v]['x'])])
        
        return jsonify({'path': path_coordinates, 'explored': explored_coordinates})
    
    except ValueError:
        return jsonify({'error': 'Invalid node IDs, must be integers'}), 400
    

# auth routes

# @main_routes.route("/sign_up", methods=['POST'])
# def sign_up():
#     data = request.get_json()
    
#     users_email = data.get("email")
#     users_password = data.get("password")
    
#     if not users_email or not users_password:
#         return jsonify({"error": "Email and password required"}), 400

#     response = supabase.auth.sign_up({
#             "email": users_email,
#             "password": users_password
#     })

#     return jsonify(response.model_dump())

# @main_routes.route("/sign_in_with_password", methods=['POST'])
# def sign_in_with_password():
#     data = request.get_json()

#     users_email = data.get("email")
#     users_password = data.get("password")

#     if not users_email or not users_password:
#         return jsonify({"error": "Email and password required"}), 400
    
#     user = supabase.auth.sign_in_with_password({ "email": users_email, "password": users_password })

#     return jsonify(user.model_dump())

# routes.py
# ----------------------
# Sign-up Route
# ----------------------
@main_routes.route("/signup", methods=["POST"])
def signup():
    data = request.json
    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")

    if not all([full_name, email, password, phone]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Create the user in Supabase Auth
        result = supabase.auth.sign_up(
            {
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                        "phone": phone,
                        "photo": None 
                    }
                }
            }
        )
        return jsonify(result.model_dump()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------
# Sign-in Route
# ----------------------
@main_routes.route("/signin", methods=["POST"])
def signin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password required"}), 400

    try:
        result = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return jsonify(result.model_dump()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
