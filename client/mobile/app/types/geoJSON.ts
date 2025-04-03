export interface GeoJSONFeature {
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}
