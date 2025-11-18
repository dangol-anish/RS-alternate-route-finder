# Project Understanding Summary

This document summarizes my understanding of the "RS-alternate-route-finder" backend implementation based on the provided context and code review.

## 1. Core Research Goal

The project aims to improve the Bidirectional A* algorithm for real-time urban navigation by incorporating an obstacle-aware penalty system. The goal is to find efficient alternative routes when unexpected obstacles (like road closures or accidents) appear on the map.

## 2. System Architecture & Technology

- **Backend Framework:** Python with **Flask**.
- **Database:** **Supabase** is used for user authentication and storing real-time obstacle data.
- **Geospatial Libraries:**
  - **osmnx:** To download and model the road network from OpenStreetMap.
  - **networkx:** To represent the road network as a graph.
  - **scipy & numpy:** For spatial calculations (e.g., KD-Tree, Convex Hull).
- **Deployment/Hosting:** The code includes references to Render for hosting (`keep_alive` function) and Cloudinary for image storage.

## 3. Workflow Overview

1.  **Graph Preparation (`preprocess_graph.py`):**
    - The road networks for "Kathmandu, Nepal" and "Lalitpur, Nepal" are downloaded using `osmnx`.
    - This network is saved as a `networkx` graph into a file named `kathmandu_lalitpur_graph.gpickle` for fast loading on server startup.

2.  **Server Initialization (`app.py`, `routes.py`):**
    - The Flask app starts.
    - The pre-processed graph is loaded from the `.gpickle` file.
    - A **Spatial Index** is built from the graph to enable fast lookups (`initialize_spatial_index`).

3.  **Real-time Pathfinding (`/shortest_path` endpoint):**
    - A user requests a path from a `source` to a `destination`.
    - The server fetches the latest obstacle data from Supabase (using an in-memory cache to limit database calls).
    - The `bidirectional_astar` function is called.
    - This function uses the **Spatial Index** to perform the path search while actively avoiding obstacles.
    - The resulting path and explored nodes are returned as coordinates.

## 4. Core Algorithm Details

### Pathfinding Algorithm (`pathfinding.py`)

- The core algorithm is **Bidirectional A***. It searches from both the start and end points simultaneously until the two searches meet.
- The heuristic used is the **Haversine distance** (`utils.py`), which calculates the straight-line distance between two GPS points.

### Obstacle Handling Mechanism

This is the most critical part of your contribution.

- **Data Source:** Obstacles are stored in a Supabase table and fetched in real-time.
- **Avoidance Strategy:** The current implementation uses a **Hard Exclusion** strategy.
  - When the A* algorithm explores neighbors of a node, it checks (using the Spatial Index):
    1.  If the neighbor node itself is an obstacle (`is_obstacle`).
    2.  If the neighbor node is within a configurable radius of any obstacle (`is_near_obstacle`).
    3.  If the edge (road segment) leading to the neighbor passes too close to an obstacle (`is_edge_near_obstacle`).
  - If any of these conditions are true, the algorithm **completely ignores** that path segment (`continue`). It does not add a penalty; it simply forbids the route.

### Performance Optimizations

- **Path Caching (`cache_utils.py`):** Previously calculated paths are cached. A cache key is generated from the source, destination, and the current list of obstacles, ensuring that new obstacles invalidate the relevant cached paths.
- **Spatial Indexing (`spatial_index.py`):** This is a major optimization. Instead of searching through lists of nodes or edges, it uses a **k-d tree** and dictionary lookups for O(1) or O(log n) operations for:
  - Checking if a node exists.
  - Finding a node's neighbors.
  - Getting edge data.
  - Checking if a node is an obstacle.
