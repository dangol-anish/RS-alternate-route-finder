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
import traceback
from datetime import datetime, timedelta, timezone
import threading
import time
import pickle
import osmnx as ox

# Load road network graph
place_names = ["Kathmandu, Nepal", "Lalitpur, Nepal"]

print("Loading preprocessed graph from gpickle...")
start = time.time()
with open("kathmandu_lalitpur_graph.gpickle", "rb") as f:
    graph = pickle.load(f)
print(f"Graph loaded in {time.time() - start:.2f} seconds.")

# extracting nodes and edges here
nodes, edges = ox.graph_to_gdfs(graph)

# Initialize spatial indexing system
from spatial_index import initialize_spatial_index
from config import validate_obstacle_radius, get_obstacle_radius_preset, OBSTACLE_RADIUS_DEFAULT
spatial_index, optimized_pathfinding = initialize_spatial_index(graph)

# Set to store obstacle nodes
obstacles = set()

# In-memory obstacle cache
obstacle_cache = set()
obstacle_cache_last_updated = None
obstacle_cache_lock = threading.Lock()
OBSTACLE_CACHE_TTL = 300  # 5 minutes in seconds

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

def refresh_obstacle_cache():
    """Refresh the obstacle cache from the database."""
    global obstacle_cache, obstacle_cache_last_updated
    try:
        response = supabase.table('obstacles').select('node_id').execute()
        new_obstacles = {int(obstacle['node_id']) for obstacle in response.data}
        
        with obstacle_cache_lock:
            obstacle_cache = new_obstacles
            obstacle_cache_last_updated = time.time()
        
        print(f"Obstacle cache refreshed: {len(obstacle_cache)} obstacles")
    except Exception as e:
        print(f"Error refreshing obstacle cache: {str(e)}")

def get_obstacles_from_cache():
    """Get obstacles from cache, refreshing if necessary."""
    global obstacle_cache_last_updated
    
    current_time = time.time()
    
    # Check if cache needs refresh
    if (obstacle_cache_last_updated is None or 
        current_time - obstacle_cache_last_updated > OBSTACLE_CACHE_TTL):
        refresh_obstacle_cache()
    
    with obstacle_cache_lock:
        return obstacle_cache.copy()

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
        
        # Get obstacle radius from request (default 0.1 km)
        obstacle_radius_input = data.get('obstacle_radius', OBSTACLE_RADIUS_DEFAULT)
        
        # Handle both numeric values and preset names
        if isinstance(obstacle_radius_input, str):
            try:
                obstacle_radius = get_obstacle_radius_preset(obstacle_radius_input)
            except ValueError:
                return jsonify({'error': f'Invalid obstacle radius preset: {obstacle_radius_input}. Available: tight, standard, wide, very_wide'}), 400
        else:
            try:
                obstacle_radius = validate_obstacle_radius(obstacle_radius_input)
            except ValueError as e:
                return jsonify({'error': str(e)}), 400

        # Use spatial index for O(1) node validation instead of linear search
        if not spatial_index.node_exists(source_node) or not spatial_index.node_exists(destination_node):
            return jsonify({'error': f"Invalid nodes: {source_node}, {destination_node}"}), 400

        # Get obstacles from cache instead of database
        obstacles_from_db = get_obstacles_from_cache()

        # Perform pathfinding while avoiding obstacles using spatial indexing
        path, explored_edges = bidirectional_astar(graph, source_node, destination_node, obstacles_from_db, obstacle_radius)
        
        #after algorithm, if no path, show no path
        if path is None:
            return jsonify({'error': 'No path found'}), 400
        
        # empty list to store path coordinates
        path_coordinates = []
        # path[:-1] all except last element
        # path[1:] all except first element
        #this gets the coordinates from path
        for u, v in zip(path[:-1], path[1:]):
            #this gets the existing edge data in graph using spatial index (O(1))
            edge_data = spatial_index.get_edge_data(u, v)
            if edge_data:
                #geometry means curved lines
                if 'geometry' in edge_data:
                    path_coordinates.extend([(lat, lon) for lon, lat in edge_data['geometry'].coords])
                else:
                    # Use spatial index for O(1) coordinate lookup
                    u_coords = spatial_index.get_node_coordinates(u)
                    v_coords = spatial_index.get_node_coordinates(v)
                    if u_coords and v_coords:
                        path_coordinates.append((u_coords[0], u_coords[1]))
                        path_coordinates.append((v_coords[0], v_coords[1]))
        
        explored_coordinates = []   
        for u, v in explored_edges:
            # Use spatial index for O(1) edge data access
            edge_data = spatial_index.get_edge_data(u, v)
            if edge_data:
                if 'geometry' in edge_data:
                    explored_coordinates.append([(lat, lon) for lon, lat in edge_data['geometry'].coords])
                else:
                    # Use spatial index for O(1) coordinate lookup
                    u_coords = spatial_index.get_node_coordinates(u)
                    v_coords = spatial_index.get_node_coordinates(v)
                    if u_coords and v_coords:
                        explored_coordinates.append([(u_coords[0], u_coords[1]),
                                                   (v_coords[0], v_coords[1])])
        
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
                "photo": profile.get("photo"),
                "role": profile.get("role"),
                "reputation": profile.get("reputation", 0)
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

        # Refresh obstacle cache to include the new obstacle
        refresh_obstacle_cache()

        return jsonify({"success": True, "data": response.data}), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ----------------------
# Obstacle Report Route
# ----------------------

@main_routes.route('/get_obstacles', methods=['GET'])
def get_obstacles():
    # Fetch all obstacles with profile info
    response = supabase.table('obstacles') \
        .select('*, profiles(full_name)') \
        .execute()
    obstacles = response.data

    for obstacle in obstacles:
        # Calculate expected end time
        created_at = obstacle.get('created_at')
        expected_duration = obstacle.get('expected_duration')  # format: "HH:MM:SS"
        try:
            if created_at and expected_duration:
                created_dt = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                h, m, s = map(int, expected_duration.split(':'))
                expected_end = created_dt + timedelta(hours=h, minutes=m, seconds=s)
                # Debug print
                print("DEBUG:", obstacle['id'], "created_at:", created_at, "expected_duration:", expected_duration, "expected_end:", expected_end, "now:", datetime.utcnow().replace(tzinfo=timezone.utc), "status:", obstacle.get('status'))
                if datetime.utcnow().replace(tzinfo=timezone.utc) > expected_end:
                    obstacle['status'] = 'expired'
        except Exception as e:
            print("DEBUG EXCEPTION:", e)
            pass  # If parsing fails, skip expiry

        obstacle_id = obstacle['id']
        # Fetch all verifications for this obstacle
        verifications = supabase.table('obstacle_verifications') \
            .select('action, weight') \
            .eq('obstacle_id', obstacle_id) \
            .execute()
        verify_count = sum(v.get('weight', 1) for v in verifications.data if v['action'] == 'verify')
        dispute_count = sum(v.get('weight', 1) for v in verifications.data if v['action'] == 'dispute')
        # Status is already present in obstacle['status']
        obstacle['verify_count'] = verify_count
        obstacle['dispute_count'] = dispute_count
        # Optionally, include status explicitly
        obstacle['verification_status'] = obstacle.get('status', 'unverified')
        # Ensure admin_verified field is included (default to False if not present)
        obstacle['admin_verified'] = obstacle.get('admin_verified', False)

    return jsonify(obstacles)


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

        # Fetch the updated profile
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if not profile_response or not profile_response.data:
            return jsonify({"error": "Failed to fetch updated profile"}), 500

        profile = profile_response.data

        return jsonify({
            "success": True,
            "profile": {
                "id": user_id,
                "full_name": profile.get("full_name"),
                "photo": profile.get("photo"),
                "phone": profile.get("phone"),
                "email": profile.get("email")
            }
        })
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

        # Refresh obstacle cache to remove the deleted obstacle
        refresh_obstacle_cache()

        return jsonify({"success": True, "message": "Obstacle deleted"}), 200

    except Exception as e:
        traceback.print_exc()
        print("DELETE_OBSTACLE ERROR:", e)
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

@main_routes.route('/obstacle/verify', methods=['POST'])
def verify_obstacle():
    data = request.json
    obstacle_id = data.get('obstacle_id')
    user_id = data.get('user_id')
    action = data.get('action')  # 'verify' or 'dispute'

    if not all([obstacle_id, user_id, action]) or action not in ['verify', 'dispute']:
        return jsonify({'error': 'Missing or invalid fields'}), 400

    try:
        # Check if user is on cooldown
        cooldown_check = supabase.rpc('is_user_on_cooldown', {
            'p_user_id': user_id,
            'p_obstacle_id': obstacle_id
        }).execute()

        if cooldown_check.data:
            return jsonify({
                'error': 'Please wait before verifying/disputing again',
                'on_cooldown': True
            }), 429

        # First, check if this obstacle was admin-verified
        obstacle = supabase.table('obstacles').select('status', 'admin_verified').eq('id', obstacle_id).single().execute()
        if not obstacle.data:
            return jsonify({'error': 'Obstacle not found'}), 404
        
        is_admin_verified = obstacle.data.get('admin_verified', False)

        # Get user's reputation
        user_data = supabase.table('profiles').select('reputation').eq('id', user_id).single().execute()
        if not user_data.data:
            return jsonify({'error': 'User not found'}), 404

        user_reputation = user_data.data.get('reputation', 0)
        reputation_weight = max(1, min(3, user_reputation // 10))  # 1 vote per 10 reputation, max 3

        # Record the verification action and start cooldown
        supabase.table('verification_cooldowns').upsert({
            'user_id': user_id,
            'obstacle_id': obstacle_id,
            'action_type': action,
        }).execute()

        # Update last verification time
        supabase.table('profiles').update({
            'last_verification': 'NOW()'
        }).eq('id', user_id).execute()

        # 1. Insert or update the user's verification/dispute with reputation weight
        existing = supabase.table('obstacle_verifications') \
            .select('id') \
            .eq('obstacle_id', obstacle_id) \
            .eq('user_id', user_id) \
            .maybe_single().execute()

        if existing and existing.data:
            supabase.table('obstacle_verifications') \
                .update({
                    'action': action,
                    'weight': reputation_weight
                }) \
                .eq('id', existing.data['id']) \
                .execute()
        else:
            supabase.table('obstacle_verifications') \
                .insert({
                    'obstacle_id': obstacle_id,
                    'user_id': user_id,
                    'action': action,
                    'weight': reputation_weight
                }).execute()

        # 2. Count weighted verifications/disputes for this obstacle
        verifications = supabase.table('obstacle_verifications') \
            .select('action, weight') \
            .eq('obstacle_id', obstacle_id) \
            .execute()
        
        verify_count = sum(v['weight'] for v in verifications.data if v['action'] == 'verify')
        dispute_count = sum(v['weight'] for v in verifications.data if v['action'] == 'dispute')

        # 3. Update obstacle status based on thresholds, but only if not admin-verified
        if not is_admin_verified:
            if verify_count >= 5:  # Increased threshold for weighted votes
                new_status = 'verified'
            elif dispute_count >= 5:
                new_status = 'flagged'
            else:
                new_status = 'unverified'

            supabase.table('obstacles').update({'status': new_status}) \
                .eq('id', obstacle_id).execute()
        else:
            # If admin-verified, only update if disputes exceed verifications significantly
            if dispute_count > verify_count + 10:  # Higher threshold for weighted votes
                new_status = 'flagged'
                supabase.table('obstacles').update({
                    'status': new_status,
                    'admin_verified': False
                }).eq('id', obstacle_id).execute()
            else:
                new_status = obstacle.data['status']

        # 4. Update user reputation based on consensus
        if new_status in ['verified', 'flagged']:
            for v in verifications.data:
                try:
                    reputation_change = 2 if (
                        (new_status == 'verified' and v['action'] == 'verify') or
                        (new_status == 'flagged' and v['action'] == 'dispute')
                    ) else -1

                    supabase.table('profiles').update({
                        'reputation': f"reputation + {reputation_change}"
                    }).eq('id', v['user_id']).execute()
                except Exception as rep_e:
                    traceback.print_exc()

        return jsonify({
            'success': True,
            'verify_count': verify_count,
            'dispute_count': dispute_count,
            'status': new_status,
            'admin_verified': is_admin_verified,
            'reputation_weight': reputation_weight
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@main_routes.route('/obstacle/verifications/<obstacle_id>', methods=['GET'])
def get_obstacle_verifications(obstacle_id):
    try:
        # Get user_id from query parameter if provided
        user_id = request.args.get('user_id')
        
        # Fetch all verifications for this obstacle
        verifications = supabase.table('obstacle_verifications') \
            .select('action') \
            .eq('obstacle_id', obstacle_id) \
            .execute()
        verify_count = sum(1 for v in verifications.data if v['action'] == 'verify')
        dispute_count = sum(1 for v in verifications.data if v['action'] == 'dispute')

        # Fetch obstacle status
        obstacle_resp = supabase.table('obstacles').select('status').eq('id', obstacle_id).single().execute()
        if not obstacle_resp.data:
            return jsonify({
                'verify_count': verify_count,
                'dispute_count': dispute_count,
                'status': 'not_found'
            }), 200
        status = obstacle_resp.data['status']

        # Check if current user has voted on this obstacle
        user_action = None
        if user_id:
            user_verification = supabase.table('obstacle_verifications') \
                .select('action') \
                .eq('obstacle_id', obstacle_id) \
                .eq('user_id', user_id) \
                .maybe_single().execute()
            
            if user_verification.data:
                user_action = user_verification.data['action']

        return jsonify({
            'verify_count': verify_count,
            'dispute_count': dispute_count,
            'status': status,
            'user_action': user_action
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/obstacle/verifications/batch', methods=['POST'])
def get_obstacle_verifications_batch():
    try:
        data = request.json
        obstacle_ids = data.get('obstacle_ids', [])
        
        if not obstacle_ids:
            return jsonify({'error': 'No obstacle IDs provided'}), 400
        
        # Fetch all verifications for the given obstacles in one query
        verifications = supabase.table('obstacle_verifications') \
            .select('obstacle_id, action') \
            .in_('obstacle_id', obstacle_ids) \
            .execute()
        
        # Fetch all obstacle statuses in one query
        obstacles = supabase.table('obstacles') \
            .select('id, status') \
            .in_('id', obstacle_ids) \
            .execute()
        
        # Create a map of obstacle statuses
        obstacle_status_map = {obs['id']: obs['status'] for obs in obstacles.data}
        
        # Process verifications and count them per obstacle
        verification_counts = {}
        for obstacle_id in obstacle_ids:
            verification_counts[obstacle_id] = {
                'verify_count': 0,
                'dispute_count': 0,
                'status': obstacle_status_map.get(obstacle_id, 'not_found')
            }
        
        # Count verifications and disputes for each obstacle
        for verification in verifications.data:
            obstacle_id = verification['obstacle_id']
            action = verification['action']
            
            if obstacle_id in verification_counts:
                if action == 'verify':
                    verification_counts[obstacle_id]['verify_count'] += 1
                elif action == 'dispute':
                    verification_counts[obstacle_id]['dispute_count'] += 1
        
        return jsonify(verification_counts), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/admin/obstacles', methods=['GET'])
def admin_list_obstacles():
    admin_id = request.args.get('admin_id')
    if not admin_id:
        return jsonify({'error': 'Missing admin_id'}), 400
    # Check if user is admin
    admin_check = supabase.table('profiles').select('role').eq('id', admin_id).single().execute()
    if not admin_check.data or admin_check.data.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admins only'}), 403
    # Fetch flagged or unverified obstacles
    obstacles_resp = supabase.table('obstacles') \
        .select('*, profiles(full_name)') \
        .in_('status', ['flagged', 'unverified']) \
        .execute()
    return jsonify(obstacles_resp.data), 200

@main_routes.route('/admin/obstacle_action', methods=['POST'])
def admin_obstacle_action():
    data = request.json
    admin_id = data.get('admin_id')
    obstacle_id = data.get('obstacle_id')
    action = data.get('action')  # 'approve', 'remove', 'reset'

    if not all([admin_id, obstacle_id, action]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if user is admin
    admin_check = supabase.table('profiles').select('role').eq('id', admin_id).single().execute()
    if not admin_check.data or admin_check.data.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admins only'}), 403

    if action == 'approve':
        # Set status to 'verified' and mark as admin-verified
        supabase.table('obstacles').update({
            'status': 'verified',
            'admin_verified': True
        }).eq('id', obstacle_id).execute()
        return jsonify({'success': True, 'message': 'Obstacle approved (verified)'}), 200
    elif action == 'remove':
        # Delete the obstacle
        supabase.table('obstacles').delete().eq('id', obstacle_id).execute()
        return jsonify({'success': True, 'message': 'Obstacle removed'}), 200
    elif action == 'reset':
        # Set status to 'unverified' and remove admin verification
        supabase.table('obstacles').update({
            'status': 'unverified',
            'admin_verified': False
        }).eq('id', obstacle_id).execute()
        return jsonify({'success': True, 'message': 'Obstacle status reset to unverified'}), 200
    else:
        return jsonify({'error': 'Invalid action'}), 400

