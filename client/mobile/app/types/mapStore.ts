import { LatLng } from "react-native-maps";
import { GeoJSONFeature } from "./geoJSON";
import { Obstacle } from "./obstacle";

export type MapStore = {
  source: GeoJSONFeature | null;
  destination: GeoJSONFeature | null;
  path: LatLng[];
  exploredEdges: LatLng[][];
  obstacles: Set<string>;
  setObstacles: (obstacles: Set<string>) => void;
  setSource: (source: GeoJSONFeature | null) => void;
  setDestination: (destination: GeoJSONFeature | null) => void;
  setPath: (path: LatLng[]) => void;
  setExploredEdges: (edges: LatLng[][]) => void;
  isObstacleMode: boolean;
  setIsObstacleMode: (val: boolean) => void;
  clearPath: () => void;
  // settings
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  // obstacles
  selectedObstacle: Obstacle | null;
  setSelectedObstacle: (obstacle: Obstacle | null) => void;
};
