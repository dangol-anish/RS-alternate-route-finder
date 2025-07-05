import { GeoJSONFeature } from "./geoJSON";
import { Obstacle } from "./obstacle";

export interface LatLng {
  latitude: number;
  longitude: number;
}

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
  mapRef: React.RefObject<any>;
  onRoutePress: () => void;
  mapZoomedToUser: React.MutableRefObject<boolean>;
}

// Default export to satisfy Expo Router's requirement
export default MapComponentProps;
