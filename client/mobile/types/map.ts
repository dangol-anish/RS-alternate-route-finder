import { LatLng } from "react-native-maps";
import MapView from "react-native-maps";
import { GeoJSONFeature } from "./geoJSON";
import { Obstacle } from "./obstacle";

export interface MapComponentProps {
  toggleObstacle: (nodeId: string) => void;
  nodes: GeoJSONFeature[];
  userLocation: LatLng | null;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  setMapRegion: (region: any) => void;
  obstaclesDb: Obstacle[];
  mapRef: React.RefObject<MapView>;
  onRoutePress: () => void;
  mapZoomedToUser: React.MutableRefObject<boolean>;
}

// Default export to satisfy Expo Router's requirement
export default MapComponentProps;
