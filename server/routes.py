from dotenv import load_dotenv
load_dotenv()

from flask import Blueprint, jsonify, request, render_template
from pathfinding import bidirectional_astar
from utils import haversine, heuristic
import os
from supabase import create_client, Client
from flask import jsonify
import requests

import cloudinary
import cloudinary.uploader
import base64
import io
from PIL import Image

from scipy.spatial import ConvexHull
import numpy as np



url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

cloudName: str = os.environ.get("CLOUDINARY_CLOUD_NAME")
cloudApiKey: str = os.environ.get("CLOUDINARY_API_KEY")
cloudSecretKey: str = os.environ.get("CLOUDINARY_SECRET_KEY")

cloudinary.config(
    cloud_name=cloudName,
    api_key=cloudApiKey,
    api_secret=cloudSecretKey
)

# Define a Blueprint to keep routes separate
main_routes = Blueprint('main', __name__)

# Load road network graph
import osmnx as ox
place_names = ["Kathmandu, Nepal", "Lalitpur, Nepal"]

# we get all the values for nodes and edges here
graph = ox.graph_from_place(place_names, network_type="all")
# extracting nodes and edges here
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

# @main_routes.route('/shortest_path', methods=['POST'])
# def shortest_path():
#     data = request.get_json()
    
#     if not data or 'source' not in data or 'destination' not in data:
#         return jsonify({'error': 'Invalid input data'}), 400

#     try:
#         source_node = int(data['source'])
#         destination_node = int(data['destination'])

#         if source_node not in graph.nodes or destination_node not in graph.nodes:
#             return jsonify({'error': f"Invalid nodes: {source_node}, {destination_node}"}), 400

#         path, explored_edges = bidirectional_astar(graph, source_node, destination_node, obstacles)
#         if path is None:
#             return jsonify({'error': 'No path found'}), 400
        
#         path_coordinates = []
#         for u, v in zip(path[:-1], path[1:]):
#             edge_data = graph.get_edge_data(u, v)
#             if edge_data:
#                 edge_info = edge_data[0]
#                 if 'geometry' in edge_info:
#                     path_coordinates.extend([(lat, lon) for lon, lat in edge_info['geometry'].coords])
#                 else:
#                     path_coordinates.append((graph.nodes[u]['y'], graph.nodes[u]['x']))
#                     path_coordinates.append((graph.nodes[v]['y'], graph.nodes[v]['x']))
        
#         explored_coordinates = []   
#         for u, v in explored_edges:
#             edge_data = graph.get_edge_data(u, v)
#             if edge_data:
#                 edge_info = edge_data[0]
#                 if 'geometry' in edge_info:
#                     explored_coordinates.append([(lat, lon) for lon, lat in edge_info['geometry'].coords])
#                 else:
#                     explored_coordinates.append([(graph.nodes[u]['y'], graph.nodes[u]['x']),
#                                                  (graph.nodes[v]['y'], graph.nodes[v]['x'])])
        
#         return jsonify({'path': path_coordinates, 'explored': explored_coordinates})
    
#     except ValueError:
#         return jsonify({'error': 'Invalid node IDs, must be integers'}), 400
    
@main_routes.route('/shortest_path', methods=['POST'])
def shortest_path():
    # extract json data from HTTP POST
    data = request.get_json()
    # if there is no data or there is no "source" or "destination" in data
    # then it is a bad request
    if not data or 'source' not in data or 'destination' not in data:
        return jsonify({'error': 'Invalid input data'}), 400
    
    try:
        #taking out source and detination from data in integer format
        source_node = int(data['source'])
        destination_node = int(data['destination'])

        #checks whether the taken source and destination exists in graph
        if source_node not in graph.nodes or destination_node not in graph.nodes:
            return jsonify({'error': f"Invalid nodes: {source_node}, {destination_node}"}), 400

        try:
            # bringing out all the obstacles stored in the database
            #convert them into int and store them in a set
            response = supabase.table('obstacles').select('node_id').execute()
            obstacles_from_db = {int(obstacle['node_id']) for obstacle in response.data}
        except Exception as e:
            return jsonify({'error': f"Error fetching obstacles: {str(e)}"}), 500

        # Perform pathfinding while avoiding obstacles
        path, explored_edges = bidirectional_astar(graph, source_node, destination_node, obstacles_from_db)
        
        #after algorithm, if no path, show no path
        if path is None:
            return jsonify({'error': 'No path found'}), 400
        
        # empty list to store path coordinates
        path_coordinates = []
        # path[:-1] all except last element
        # path[1:] all except first element
        #this gets the coordinates from path
        for u, v in zip(path[:-1], path[1:]):
            #this gets the existing edge data in graph
            edge_data = graph.get_edge_data(u, v)
            if edge_data:
                edge_info = edge_data[0]
                #geometry means curved lines
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
    
    except ValueError as e:
        return jsonify({'error': f'Invalid node IDs, must be integers. {str(e)}'}), 400


# auth routes

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
        # Authenticate with Supabase Auth
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        session = result.session
        user = result.user

        if not user or not session:
            return jsonify({"error": "Invalid login credentials"}), 401

        # Fetch profile from `profiles` table using the user ID
        profile_response = supabase.table("profiles").select("*").eq("id", user.id).single().execute()

        # Safer error handling
        if not profile_response or not profile_response.data:
            return jsonify({"error": "Failed to fetch user profile"}), 500

        profile = profile_response.data

        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": profile.get("full_name"),
                "phone": profile.get("phone"),
                "photo": profile.get("photo")
            },
            "session": {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------
# Sign-out Route
# ----------------------
@main_routes.route("/signout", methods=["POST"])
def logout():
    try:
        supabase.auth.sign_out()

        return jsonify({"message": "Successfully signed out"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------
# Obstacle Report Route
# ----------------------
@main_routes.route("/save_obstacles", methods=["POST"])
def create_obstacle():
    data = request.json

    print("Received Data:", data)

    required_fields = ["node_id", "latitude", "longitude", "name", "type", "expected_duration", "severity", "owner"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    image_url = None

    try:
        # Handle image upload if provided
        image_base64 = data.get("image")  # optional field
        if image_base64:
            # Only handle image upload if base64 image is provided
            if "," in image_base64:
                _, encoded = image_base64.split(",", 1)  # strip out the "data:image/jpeg;base64," part
            else:
                encoded = image_base64

            # Decode base64 image to bytes
            image_data = base64.b64decode(encoded)
            upload_result = cloudinary.uploader.upload(io.BytesIO(image_data))  # upload to Cloudinary
            image_url = upload_result.get("secure_url")  # Get the secure URL for the image

        # Insert into Supabase with Cloudinary URL if image is uploaded
        response = supabase.table("obstacles").insert({
            "node_id": data["node_id"],
            "latitude": data["latitude"],
            "longitude": data["longitude"],
            "name": data["name"],
            "type": data["type"],
            "expected_duration": data["expected_duration"],
            "severity": data["severity"],
            "comments": data.get("comments", ""),
            "owner": data["owner"],
            "image_url": image_url  # Save the Cloudinary URL here
        }).execute()

        print("Response from Supabase:", response)

        return jsonify({"success": True, "data": response.data}), 201

    except Exception as e:
        print("Error occurred:", e)
        return jsonify({"error": str(e)}), 500

# ----------------------
# Obstacle Report Route
# ----------------------

@main_routes.route('/get_obstacles', methods=['GET'])
def get_obstacles():
    # This assumes you have a foreign key from obstacles.owner -> users.id
    response = supabase.table('obstacles') \
        .select('*, profiles(full_name)') \
        .execute()
    return jsonify(response.data)


# ----------------------
# Update Profile
# ----------------------
@main_routes.route("/update_profile", methods=["POST"])
def update_profile():
    data = request.json
    user_id = data.get("id")
    full_name = data.get("full_name")
    photo_base64 = data.get("photo")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        photo_url = None

        if photo_base64:
            if "," in photo_base64:
                _, encoded = photo_base64.split(",", 1)
            else:
                encoded = photo_base64

            image_data = base64.b64decode(encoded)

            upload_result = cloudinary.uploader.upload(io.BytesIO(image_data))
            photo_url = upload_result.get("secure_url")

        update_data = {"full_name": full_name}
        if photo_url:
            update_data["photo"] = photo_url

        supabase.table("profiles").update(update_data).eq("id", user_id).execute()

        return jsonify({"success": True, "photo_url": photo_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ----------------------
# Delete Obstacle (Only by Owner)
# ----------------------
@main_routes.route('/delete_obstacle', methods=['POST'])
def delete_obstacle():
    data = request.json
    obstacle_id = data.get("id")
    requester_id = data.get("owner")

    print("Received request to delete:", obstacle_id, "from user:", requester_id)


    if not obstacle_id or not requester_id:
        return jsonify({"error": "Missing obstacle ID or owner ID"}), 400

    try:
        # First, check if the obstacle exists and is owned by the requester
        response = supabase.table("obstacles").select("id", "owner").eq("id", obstacle_id).single().execute()

        if not response.data:
            return jsonify({"error": "Obstacle not found"}), 404

        if response.data["owner"] != requester_id:
            return jsonify({"error": "Unauthorized: You can only delete your own obstacle"}), 403

        # Perform the deletion
        delete_response = supabase.table("obstacles").delete().eq("id", obstacle_id).execute()

        return jsonify({"success": True, "message": "Obstacle deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#map boundary

@main_routes.route('/map_boundary', methods=['GET'])
def map_boundary():
    try:
        coords = np.array([(data['x'], data['y']) for node, data in graph.nodes(data=True)])
        hull = ConvexHull(coords)
        boundary_coords = [(coords[vertex][1], coords[vertex][0]) for vertex in hull.vertices]  # lat, lon
        return jsonify({"boundary": boundary_coords})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

    # Add search functionality to backend (Flask)
# Define a search route
@main_routes.route('/search_place', methods=['GET'])
def search_place():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    try:
        nominatim_url = f"https://nominatim.openstreetmap.org/search"
        params = {
            'q': query,
            'format': 'json',
            'limit': 5,
            'countrycodes': 'np'
        }

        headers = {
            'User-Agent': 'YourAppName/1.0 (your@email.com)'
        }

        response = requests.get(nominatim_url, params=params, headers=headers)
        results = response.json()

        places = [{
            "display_name": place.get("display_name"),
            "lat": float(place.get("lat")),
            "lon": float(place.get("lon"))
        } for place in results]

        return jsonify(places)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

