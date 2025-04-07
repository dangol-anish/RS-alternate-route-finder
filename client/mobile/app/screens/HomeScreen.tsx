import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import MapComponent from "../components/MapComponent";
import ObstacleToggleButton from "../components/ObstacleToggleButton";
import { useNodes } from "../hooks/useNodes";
import { updateObstacles, fetchShortestPath } from "../utils/api";
import { GeoJSONFeature } from "../types/geoJSON";
import { LatLng } from "react-native-maps";

export default function HomeScreen() {
  const { nodes } = useNodes();
  const [source, setSource] = useState<GeoJSONFeature | null>(null);
  const [destination, setDestination] = useState<GeoJSONFeature | null>(null);
  const [path, setPath] = useState<LatLng[]>([]);
  const [exploredEdges, setExploredEdges] = useState<LatLng[][]>([]);
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [isObstacleMode, setIsObstacleMode] = useState(false);

  useEffect(() => {
    if (source && destination) {
      findShortestPath();
    }
  }, [source, destination]);

  const findShortestPath = async () => {
    if (!source || !destination) {
      Alert.alert("Error", "Source or Destination is missing!");
      return;
    }
    try {
      const response = await fetchShortestPath(source.id, destination.id);

      if (response.error) {
        Alert.alert("Error", response.error);
      } else {
        setPath(
          response.path.map(([lat, lon]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          }))
        );

        setExploredEdges(
          response.explored.map((edge: [number, number][]) =>
            edge.map(([lat, lon]) => ({
              latitude: lat,
              longitude: lon,
            }))
          )
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to find shortest path");
    }
  };

  const toggleObstacle = (nodeId: string) => {
    const newObstacles = new Set(obstacles);
    if (newObstacles.has(nodeId)) {
      newObstacles.delete(nodeId);
    } else {
      newObstacles.add(nodeId);
    }
    setObstacles(newObstacles);

    try {
      updateObstacles(Array.from(newObstacles));
    } catch (error) {
      Alert.alert("Error", "Failed to update obstacles");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapComponent
        source={source}
        destination={destination}
        obstacles={obstacles}
        path={path}
        exploredEdges={exploredEdges}
        isObstacleMode={isObstacleMode}
        toggleObstacle={toggleObstacle}
        setSource={setSource}
        setDestination={setDestination}
        nodes={nodes}
      />
      <ObstacleToggleButton
        isObstacleMode={isObstacleMode}
        setIsObstacleMode={setIsObstacleMode}
      />
    </View>
  );
}
