import React, { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import MapView, { Marker, Polyline, MapPressEvent } from "react-native-maps";
import { GeoJSONFeature } from "../types/geoJSON";
import { LatLng } from "react-native-maps";
import { useMapStore } from "../store/useMapStore";

interface MapComponentProps {
  obstacles: Set<string>;
  isObstacleMode: boolean;
  toggleObstacle: (nodeId: string) => void;
  nodes: GeoJSONFeature[];
  userLocation: LatLng | null;
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

const MapComponent: React.FC<MapComponentProps> = ({
  obstacles,
  isObstacleMode,
  toggleObstacle,
  nodes,
  userLocation,
  mapRegion,
  setMapRegion,
}) => {
  const {
    source,
    destination,
    path,
    exploredEdges,
    setSource,
    setDestination,
  } = useMapStore();

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

  useEffect(() => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [userLocation]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={mapRegion} // Dynamically controlled by the state
        onRegionChangeComplete={(newRegion) => setMapRegion(newRegion)} // Update the region when the user manually changes it
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
