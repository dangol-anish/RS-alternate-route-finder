import React from "react";
import { View, Alert } from "react-native";
import MapView, {
  Marker,
  Polyline,
  LatLng,
  MapPressEvent,
} from "react-native-maps";
import { GeoJSONFeature } from "../types/geoJSON";
import { fetchShortestPath } from "../utils/api";

interface MapComponentProps {
  source: GeoJSONFeature | null;
  destination: GeoJSONFeature | null;
  obstacles: Set<string>;
  path: LatLng[];
  exploredEdges: LatLng[][];
  isObstacleMode: boolean;
  toggleObstacle: (nodeId: string) => void;
  setSource: (source: GeoJSONFeature) => void;
  setDestination: (destination: GeoJSONFeature) => void;
  nodes: GeoJSONFeature[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  source,
  destination,
  obstacles,
  path,
  exploredEdges,
  isObstacleMode,
  toggleObstacle,
  setSource,
  setDestination,
  nodes,
}) => {
  const findNearestNode = (
    latitude: number,
    longitude: number
  ): GeoJSONFeature | null => {
    if (!nodes.length) return null;

    let nearestNode = nodes[0];
    let minDist = Math.hypot(
      nearestNode.geometry.coordinates[1] - latitude,
      nearestNode.geometry.coordinates[0] - longitude
    );

    nodes.forEach((node) => {
      const dist = Math.hypot(
        node.geometry.coordinates[1] - latitude,
        node.geometry.coordinates[0] - longitude
      );
      if (dist < minDist) {
        nearestNode = node;
        minDist = dist;
      }
    });
    return nearestNode;
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 27.7172,
          longitude: 85.324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={(event: MapPressEvent) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          const closestNode = findNearestNode(latitude, longitude);

          if (!closestNode) {
            Alert.alert("Error", "No closest node found!");
            return;
          }

          if (isObstacleMode) {
            toggleObstacle(closestNode.id);
          } else if (!source) {
            setSource(closestNode);
          } else if (!destination) {
            setDestination(closestNode);
          }
        }}
      >
        {source && (
          <Marker
            coordinate={{
              latitude: source.geometry.coordinates[1],
              longitude: source.geometry.coordinates[0],
            }}
            pinColor="blue"
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.geometry.coordinates[1],
              longitude: destination.geometry.coordinates[0],
            }}
            pinColor="green"
          />
        )}

        {Array.from(obstacles).map((nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          return (
            node && (
              <Marker
                key={node.id}
                coordinate={{
                  latitude: node.geometry.coordinates[1],
                  longitude: node.geometry.coordinates[0],
                }}
                pinColor="black"
              />
            )
          );
        })}

        {/* {exploredEdges.map((edge, index) => (
          <Polyline
            key={index}
            coordinates={edge}
            strokeColor="red"
            strokeWidth={3}
          />
        ))} */}

        {path.length > 0 && (
          <Polyline coordinates={path} strokeColor="green" strokeWidth={5} />
        )}
      </MapView>
    </View>
  );
};

export default MapComponent;
