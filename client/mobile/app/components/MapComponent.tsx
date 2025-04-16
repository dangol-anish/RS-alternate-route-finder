import React, { useEffect, useRef, useState } from "react";
import { View, Alert } from "react-native";
import MapView, { Marker, Polyline, MapPressEvent } from "react-native-maps";
import { GeoJSONFeature } from "../types/geoJSON";
import { LatLng } from "react-native-maps";
import { useMapStore } from "../store/useMapStore";
import ObstacleDetailsModal from "./obstacles/ObstacleDetailsModal";

// testing
import ObstacleForm from "./obstacles/ObstacleForm";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { Obstacle } from "@/app/types/obstacle";

interface MapComponentProps {
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

const MapComponent: React.FC<MapComponentProps> = ({
  toggleObstacle,
  nodes,
  userLocation,
  mapRegion,
  setMapRegion,
  obstaclesDb,
  mapRef,
}) => {
  const {
    source,
    destination,
    path,
    exploredEdges,
    setSource,
    setDestination,
    obstacles,
    isObstacleMode,
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
    if (userLocation && mapRef.current) {
      // Animate map to the current user location
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation]);

  const locateCurrentLocation = () => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  //testing
  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GeoJSONFeature | null>(null);
  const user = useAuthStore((state) => state.user);
  const selectedObstacle = useMapStore((state) => state.selectedObstacle);
  const setSelectedObstacle = useMapStore((state) => state.setSelectedObstacle);
  // const mapRef = useRef<MapView | null>(null);

  const handleFormSubmit = async (formData: {
    name: string;
    type: string;
    expected_duration: string;
    severity: string;
    comments?: string;
  }) => {
    if (!selectedNode || !userLocation) return;

    try {
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/save_obstacles`,
        {
          node_id: selectedNode.id,
          latitude: selectedNode.geometry.coordinates[1],
          longitude: selectedNode.geometry.coordinates[0],
          name: formData.name,
          type: formData.type,
          expected_duration: formData.expected_duration,
          severity: formData.severity,
          comments: formData.comments,
          owner: user?.id, // Replace with actual user id (optional: from auth token)
        }
      );

      console.log("Obstacle saved:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error saving obstacle:", error.response?.data); // Log the response from the server
        Alert.alert("Error", error.response?.data?.error || "Unknown error");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={mapRegion} // Dynamically controlled by the state
        onRegionChangeComplete={(newRegion) => setMapRegion(newRegion)} // Update the region when the user manually changes it
        onPress={(event: MapPressEvent) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          const closestNode = findNearestNode(latitude, longitude);

          if (!closestNode) {
            Alert.alert("Error", "No closest node found!");
            return;
          }

          if (isObstacleMode) {
            setSelectedNode(closestNode);
            setShowForm(true); // Show the form
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

        {obstaclesDb.map((obstacle, index) => (
          <Marker
            key={`db-obstacle-${index}`}
            coordinate={{
              latitude: obstacle.latitude,
              longitude: obstacle.longitude,
            }}
            pinColor="red"
            onPress={() => setSelectedObstacle(obstacle)}
          />
        ))}

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
      <ObstacleForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
      />
      <ObstacleDetailsModal />
    </View>
  );
};

export default MapComponent;
