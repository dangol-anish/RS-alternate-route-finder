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
