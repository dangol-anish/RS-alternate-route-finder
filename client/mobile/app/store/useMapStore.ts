import { create } from "zustand";
import { MapStore } from "../types/mapStore";

export const useMapStore = create<MapStore>((set, get) => ({
  source: null,
  destination: null,
  path: [],
  exploredEdges: [],
  obstacles: new Set(),
  isObstacleMode: false,

  setSource: (source) => set({ source }),
  setDestination: (destination) => set({ destination }),
  setPath: (path) => set({ path }),
  setExploredEdges: (edges) => set({ exploredEdges: edges }),
  setObstacles: (obstacles) => set({ obstacles }),
  setIsObstacleMode: (val) => set({ isObstacleMode: val }),
  clearPath: () =>
    set({
      source: null,
      destination: null,
      path: [],
      exploredEdges: [],
      obstacles: new Set(null),
    }),
  showSettings: false,
  setShowSettings: (val) => set({ showSettings: val }),
  selectedObstacle: null,
  setSelectedObstacle: (obstacle) => set({ selectedObstacle: obstacle }),
  //test
}));
