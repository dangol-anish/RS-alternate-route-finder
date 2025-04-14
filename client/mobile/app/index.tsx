import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import MapComponent from "@/app/components/MapComponent";
import { useNodes } from "@/app/hooks/useNodes";
import { updateObstacles, fetchShortestPath } from "./utils/api";
import { LatLng } from "react-native-maps";
import HeaderComponent from "@/app/components/HeaderComponent";
import FloatingActionComponent from "./components/FloatingActionComponent";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useMapStore } from "./store/useMapStore";
import Menu from "./components/auth/Menu";

export default function App() {
  const router = useRouter();
  const { nodes } = useNodes();

  const {
    source,
    destination,
    path,
    exploredEdges,
    obstacles,
    setObstacles,
    setSource,
    setDestination,
    setPath,
    setExploredEdges,
    isObstacleMode,
    setIsObstacleMode,
    showSettings,
    setShowSettings,
  } = useMapStore();

  // State to hold the user's current location
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 27.7,
    longitude: 85.3,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  //clear path
  const clearPath = () => {
    setSource(null);
    setDestination(null);
    setPath([]);
    setExploredEdges([]);
    setObstacles(new Set());
  };

  // Get user location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission for location not granted");
      return;
    }

    let location = await Location.getCurrentPositionAsync();
    const { latitude, longitude } = location.coords;
    setUserLocation({ latitude, longitude });
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const locateCurrentLocation = () => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

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
      <HeaderComponent />
      <MapComponent
        toggleObstacle={toggleObstacle}
        nodes={nodes}
        userLocation={userLocation}
        mapRegion={mapRegion}
        setMapRegion={setMapRegion}
      />

      <FloatingActionComponent
        isObstacleMode={isObstacleMode}
        setIsObstacleMode={setIsObstacleMode}
        onLocateCurrentLocation={locateCurrentLocation}
        clearPath={clearPath}
      />
      {showSettings && <Menu />}
    </View>
  );
}
