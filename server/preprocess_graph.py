import osmnx as ox
import networkx as nx
import time
import pickle

place_names = ["Kathmandu, Nepal", "Lalitpur, Nepal"]
print("Downloading and building the graph...")
start = time.time()
graph = ox.graph_from_place(place_names, network_type="all")
build_time = time.time() - start
print(f"Graph built in {build_time:.2f} seconds.")

print("Saving graph to kathmandu_lalitpur_graph.gpickle...")
save_start = time.time()
with open("kathmandu_lalitpur_graph.gpickle", "wb") as f:
    pickle.dump(graph, f)
save_time = time.time() - save_start
print(f"Graph saved in {save_time:.2f} seconds.")
print("Done!")