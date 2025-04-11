import { create } from "zustand";
import { GeoJSONFeature } from "@/app/types/geoJSON";
import { LatLng } from "react-native-maps";

type MapStore = {
  source: GeoJSONFeature | null;
  destination: GeoJSONFeature | null;
  path: LatLng[];
  exploredEdges: LatLng[][];
  obstacles: Set<string>;
  isObstacleMode: boolean;

  setSource: (source: GeoJSONFeature | null) => void;
  setDestination: (destination: GeoJSONFeature | null) => void;
  setPath: (path: LatLng[]) => void;
  setExploredEdges: (edges: LatLng[][]) => void;
  toggleObstacle: (nodeId: string) => void;
  setIsObstacleMode: (val: boolean) => void;
  clearPath: () => void;
  setObstacles: (obstacles: Set<string>) => void;
};

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
  toggleObstacle: (nodeId) => {
    const current = new Set(get().obstacles);
    current.has(nodeId) ? current.delete(nodeId) : current.add(nodeId);
    set({ obstacles: current });
  },
  setIsObstacleMode: (val) => set({ isObstacleMode: val }),
  clearPath: () =>
    set({ source: null, destination: null, path: [], exploredEdges: [] }),
}));
