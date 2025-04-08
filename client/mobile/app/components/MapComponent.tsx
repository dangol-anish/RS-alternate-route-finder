import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import MapView, {
  Marker,
  Polyline,
  LatLng,
  MapPressEvent,
} from "react-native-maps";
import { GeoJSONFeature } from "../types/geoJSON";
import { fetchShortestPath } from "../utils/api";
import * as Location from "expo-location";

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
  // State to hold the user's current location
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  // user location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission for location not granted");
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      // enableHighAccuracy: true,
    });

    const { latitude, longitude } = location.coords;
    setUserLocation({ latitude, longitude });

    // Set map region based on user location
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // map location state
  const [mapRegion, setMapRegion] = useState({
    latitude: 27.7,
    longitude: 85.3,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

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
        region={mapRegion} // use region instead of initialRegion for dynamic updates
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

        {path.length > 0 && (
          <Polyline coordinates={path} strokeColor="green" strokeWidth={5} />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="purple"
          />
        )}
      </MapView>
    </View>
  );
};

export default MapComponent;
