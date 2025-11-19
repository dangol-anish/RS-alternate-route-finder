# run_experiments.py
import pickle
import time
import random
import csv
import numpy as np
from pathfinding import bidirectional_astar
from spatial_index import initialize_spatial_index, get_spatial_index
from utils import haversine
from config import get_obstacle_radius_preset
import os
from shapely.geometry import LineString, Point

# --- Constants and Configuration ---
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
GRAPH_PATH = os.path.join(SCRIPT_DIR, "kathmandu_lalitpur_graph.gpickle")
NUM_TEST_CASES = 100
OBSTACLE_DENSITIES = [50, 150, 300, 500]
OBSTACLE_RADIUS_SETTINGS = ['tight', 'standard', 'wide', 'very_wide']
RESULTS_FILE = os.path.join(SCRIPT_DIR, "experiment_results.csv")
VULNERABILITY_FACTOR = 1.5 # PVI is calculated for path segments within 1.5x of the obstacle_radius

import heapq

# --- Placeholder Functions ---

def baseline_bidirectional_astar(graph, source, destination, obstacles, obstacle_radius):
    """
    A copy of the bidirectional_astar algorithm with obstacle avoidance logic disabled.
    This serves as the baseline for comparison.
    """
    spatial_index = get_spatial_index()

    if not spatial_index.node_exists(source) or not spatial_index.node_exists(destination):
        return None, 0

    open_set = []
    heapq.heappush(open_set, (0, source, 'forward'))
    heapq.heappush(open_set, (0, destination, 'backward'))

    came_from = {'forward': {}, 'backward': {}}
    g_score = {'forward': {}, 'backward': {}}
    f_score = {'forward': {}, 'backward': {}}

    g_score['forward'][source] = 0
    g_score['backward'][destination] = 0

    f_score['forward'][source] = haversine(graph.nodes[source]['y'], graph.nodes[source]['x'], graph.nodes[destination]['y'], graph.nodes[destination]['x'])
    f_score['backward'][destination] = haversine(graph.nodes[destination]['y'], graph.nodes[destination]['x'], graph.nodes[source]['y'], graph.nodes[source]['x'])

    explored_nodes_count = 0
    meeting_node = None
    max_iterations = len(graph.nodes) * 2
    iteration_count = 0

    while open_set and iteration_count < max_iterations:
        iteration_count += 1
        
        _, current, direction = heapq.heappop(open_set)
        opposite = 'backward' if direction == 'forward' else 'forward'

        if current in came_from[opposite]:
            meeting_node = current
            break

        current_g = g_score[direction].get(current, float('inf'))
        neighbors = spatial_index.get_neighbors(current)
        
        # Count explored nodes for baseline
        explored_nodes_count += len(neighbors)

        for neighbor in neighbors:
            edge_data = spatial_index.get_edge_data(current, neighbor)
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
                
                target_node_coords = graph.nodes[destination] if direction == 'forward' else graph.nodes[source]
                neighbor_coords = graph.nodes[neighbor]
                
                f_score[direction][neighbor] = tentative_g_score + haversine(neighbor_coords['y'], neighbor_coords['x'], target_node_coords['y'], target_node_coords['x'])
                heapq.heappush(open_set, (f_score[direction][neighbor], neighbor, direction))

    if meeting_node is None:
        return None, explored_nodes_count

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

    return path, explored_nodes_count

def generate_test_cases(graph_nodes, num_cases):
    """
    Generates a list of random, valid (source, destination) pairs for testing.
    """
    print(f"Generating {num_cases} test cases...")
    node_list = list(graph_nodes)
    test_cases = []
    for _ in range(num_cases):
        source, dest = random.sample(node_list, 2)
        test_cases.append((source, dest))
    print("Test cases generated.")
    return test_cases

def generate_obstacles(graph_nodes, num_obstacles):
    """
    Generates a set of random obstacle nodes from the graph.
    """
    print(f"Generating {num_obstacles} obstacles...")
    node_list = list(graph_nodes)
    return set(random.sample(node_list, num_obstacles))

def get_path_length(path, spatial_index):
    """Calculates the total length of a path in meters."""
    total_length = 0
    for u, v in zip(path[:-1], path[1:]):
        edge_data = spatial_index.get_edge_data(u, v)
        if edge_data:
            total_length += edge_data.get('length', 0)
    return total_length

def calculate_pvi(path, path_length, spatial_index, vulnerability_radius):
    """
    Calculates the Path Vulnerability Index (PVI) for a given path.
    """
    if not path or path_length == 0:
        return 0.0

    vulnerable_length = 0
    vulnerability_radius_deg = vulnerability_radius / 111.0  # Approximate conversion from km to degrees

    obstacle_coords = spatial_index.obstacle_coords.values()
    if not obstacle_coords:
        return 0.0

    for u, v in zip(path[:-1], path[1:]):
        u_coords = spatial_index.get_node_coordinates(u)
        v_coords = spatial_index.get_node_coordinates(v)
        
        if not u_coords or not v_coords:
            continue

        edge_line = LineString([(u_coords[1], u_coords[0]), (v_coords[1], v_coords[0])]) # (lon, lat)
        is_vulnerable = False
        for obs_lat, obs_lon in obstacle_coords:
            obstacle_point = Point(obs_lon, obs_lat)
            if edge_line.distance(obstacle_point) < vulnerability_radius_deg:
                is_vulnerable = True
                break
        
        if is_vulnerable:
            edge_data = spatial_index.get_edge_data(u, v)
            if edge_data:
                vulnerable_length += edge_data.get('length', 0)

    return (vulnerable_length / path_length) * 100 if path_length > 0 else 0.0

def run_experiments():
    """
    Main function to orchestrate the entire experimental process.
    """
    print("Loading graph...")
    with open(GRAPH_PATH, "rb") as f:
        graph = pickle.load(f)
    print("Graph loaded.")

    print("Initializing spatial index...")
    spatial_index, _ = initialize_spatial_index(graph)
    print("Spatial index initialized.")

    print("Generating test cases...")
    test_cases = generate_test_cases(graph.nodes, NUM_TEST_CASES)

    # --- Check for existing results and load them ---
    completed_experiments = set()
    if os.path.exists(RESULTS_FILE):
        print("Found existing results file. Resuming experiments.")
        try:
            with open(RESULTS_FILE, 'r', newline='') as f:
                reader = csv.reader(f)
                header = next(reader)  # Skip header
                for row in reader:
                    # Recreate the unique identifier for the experiment
                    if len(row) >= 3:
                        experiment_id = (int(row[0]), row[1], int(row[2]))
                        completed_experiments.add(experiment_id)
            print(f"Loaded {len(completed_experiments)} completed experiments.")
            file_mode = 'a'
        except StopIteration:
            # This handles the case where the file exists but is empty
            print("Results file is empty. Starting new experiment session.")
            file_mode = 'w'
    else:
        print("No results file found. Starting new experiment session.")
        file_mode = 'w'

    header = [
        'obstacle_density', 'radius_setting', 'test_case_num', 'source', 'destination',
        'path_found_yours', 'path_length_yours', 'time_yours', 'nodes_yours',
        'path_found_baseline', 'path_length_baseline', 'time_baseline', 'nodes_baseline',
        'pvi', 'path_inflation_ratio', 'ssr'
    ]
    
    baseline_cache = {}


    with open(RESULTS_FILE, file_mode, newline='') as f:
        writer = csv.writer(f)
        if file_mode == 'w':
            writer.writerow(header)

        total_runs = len(OBSTACLE_DENSITIES) * len(OBSTACLE_RADIUS_SETTINGS) * len(test_cases)
        current_run = len(completed_experiments)

        for density in OBSTACLE_DENSITIES:
            obstacles = generate_obstacles(graph.nodes, density)
            
            for radius_name in OBSTACLE_RADIUS_SETTINGS:
                radius_km = get_obstacle_radius_preset(radius_name)
                
                for i, (source, dest) in enumerate(test_cases):
                    experiment_id = (density, radius_name, i + 1)
                    if experiment_id in completed_experiments:
                        print(f"Skipping experiment {experiment_id} | Already completed.")
                        continue

                    current_run += 1
                    print(f"Running experiment {current_run}/{total_runs} | Density: {density}, Radius: {radius_name}, Case: {i+1}/{NUM_TEST_CASES}")

                    # --- Run Your Algorithm ---
                    start_time = time.time()
                    path_yours, nodes_yours_list = bidirectional_astar(graph, source, dest, obstacles, radius_km)
                    time_yours = time.time() - start_time
                    nodes_yours = len(nodes_yours_list)
                    
                    path_found_yours = path_yours is not None
                    path_length_yours = get_path_length(path_yours, spatial_index) if path_found_yours else 0
                    
                    # --- Run Baseline Algorithm ---
                    baseline_cache_key = (source, dest)
                    if baseline_cache_key in baseline_cache:
                        path_baseline, nodes_baseline, time_baseline = baseline_cache[baseline_cache_key]
                    else:
                        start_time = time.time()
                        path_baseline, nodes_baseline = baseline_bidirectional_astar(graph, source, dest, set(), 0)
                        time_baseline = time.time() - start_time
                        baseline_cache[baseline_cache_key] = (path_baseline, nodes_baseline, time_baseline)

                    
                    path_found_baseline = path_baseline is not None
                    path_length_baseline = get_path_length(path_baseline, spatial_index) if path_found_baseline else 0

                    # --- Calculate Metrics ---
                    pvi = calculate_pvi(path_yours, path_length_yours, spatial_index, radius_km * VULNERABILITY_FACTOR) if path_found_yours else -1
                    
                    path_inflation_ratio = (path_length_yours / path_length_baseline) if path_found_yours and path_found_baseline and path_length_baseline > 0 else -1
                    
                    ssr = (1 - (nodes_yours / nodes_baseline)) * 100 if nodes_baseline > 0 else 0

                    # --- Write to CSV ---
                    writer.writerow([
                        density, radius_name, i + 1, source, dest,
                        path_found_yours, path_length_yours, time_yours, nodes_yours,
                        path_found_baseline, path_length_baseline, time_baseline, nodes_baseline,
                        pvi, path_inflation_ratio, ssr
                    ])

    print("All experiments complete.")


if __name__ == "__main__":
    print("========================================")
    print("= Starting Pathfinding Experimentation =")
    print("========================================")
    run_experiments()
    print("========================================")
    print(f"= Experiments finished. Results saved to {RESULTS_FILE} =")
    print("========================================")
