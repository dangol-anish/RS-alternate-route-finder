export interface GeoJSONFeature {
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties?: {
    name?: string;
    [key: string]: any;
  };
}

// Default export to satisfy Expo Router's requirement
export default GeoJSONFeature;
