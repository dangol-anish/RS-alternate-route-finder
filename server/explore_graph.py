import os
import pickle
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
GRAPH_PATH = os.path.join(SCRIPT_DIR, "kathmandu_lalitpur_graph.gpickle")
CHARTS_DIR = os.path.join(SCRIPT_DIR, 'charts')

def explore_graph():
    """
    Loads the graph, prints basic statistics, and generates a histogram
    of road segment lengths.
    """
    if not os.path.exists(CHARTS_DIR):
        os.makedirs(CHARTS_DIR)
        print(f"Created directory: {CHARTS_DIR}")

    print(f"Loading graph from {GRAPH_PATH}...")
    try:
        with open(GRAPH_PATH, "rb") as f:
            graph = pickle.load(f)
        print("Graph loaded successfully.")
    except FileNotFoundError:
        print(f"Error: Graph file not found at {GRAPH_PATH}")
        return

    print("\n--- Graph Statistics ---")
    print(f"Number of nodes: {graph.number_of_nodes()}")
    print(f"Number of edges: {graph.number_of_edges()}")

    # Collect edge lengths
    edge_lengths = []
    for u, v, data in graph.edges(data=True):
        if 'length' in data:
            edge_lengths.append(data['length'])
    
    if not edge_lengths:
        print("No 'length' attribute found for edges. Cannot generate length distribution.")
        return

    print(f"Total road length: {np.sum(edge_lengths):.2f} meters")
    print(f"Average road segment length: {np.mean(edge_lengths):.2f} meters")
    print(f"Min road segment length: {np.min(edge_lengths):.2f} meters")
    print(f"Max road segment length: {np.max(edge_lengths):.2f} meters")
    print(f"Median road segment length: {np.median(edge_lengths):.2f} meters")

    # Generate histogram of road lengths
    plt.figure(figsize=(10, 6))
    plt.hist(edge_lengths, bins=50, edgecolor='black', log=True)
    plt.title('Distribution of Road Segment Lengths')
    plt.xlabel('Length (meters)')
    plt.ylabel('Number of Segments (log scale)')
    plt.grid(axis='y', alpha=0.75)
    histogram_path = os.path.join(CHARTS_DIR, 'graph_road_lengths.png')
    plt.savefig(histogram_path)
    print(f"Saved road length histogram to {histogram_path}")
    plt.close()
    print("--- Graph exploration complete. ---")

if __name__ == "__main__":
    print("===============================")
    print("= Starting Graph Exploration   =")
    print("===============================")
    explore_graph()
    print("===============================")
    print("= Graph Exploration Complete   =")
    print("===============================")
