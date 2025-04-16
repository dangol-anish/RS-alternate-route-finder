import MapView, { LatLng } from "react-native-maps";
import { GeoJSONFeature } from "./geoJSON";
import { Obstacle } from "./obstacle";

export interface MapComponentProps {
  toggleObstacle: (nodeId: string) => void;
  nodes: GeoJSONFeature[];
  obstaclesDb: Obstacle[];
  userLocation: LatLng | null;
  mapRef: React.RefObject<MapView>;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  setMapRegion: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    }>
  >;
}
