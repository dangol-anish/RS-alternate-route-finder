import { create } from "zustand";
import { MapStore } from "../types/mapStore";

type SelectionMode = "none" | "source" | "destination" | "obstacle";

export const useMapStore = create<MapStore>((set, get) => ({
  source: null,
  destination: null,
  path: [],
  exploredEdges: [],
  obstacles: new Set(),
  isObstacleMode: false,
  selectionMode: "none", // ← NEW

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
      obstacles: new Set(),
    }),
  showSettings: false,
  setShowSettings: (val) => set({ showSettings: val }),
  selectedObstacle: null,
  setSelectedObstacle: (obstacle) => set({ selectedObstacle: obstacle }),

  // ← NEW setter
  setSelectionMode: (mode: SelectionMode) =>
    set(() => ({ selectionMode: mode })),
}));
