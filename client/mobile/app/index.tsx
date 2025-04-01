import React, { useState, useEffect, useRef } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import MapView, {
  Marker,
  Polyline,
  LatLng,
  MapPressEvent,
} from "react-native-maps";
import axios from "axios";

interface GeoJSONFeature {
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export default function App() {
  const mapRef = useRef<MapView | null>(null);
  const [source, setSource] = useState<GeoJSONFeature | null>(null);
  const [destination, setDestination] = useState<GeoJSONFeature | null>(null);
  const [path, setPath] = useState<LatLng[]>([]);
  const [exploredEdges, setExploredEdges] = useState<LatLng[][]>([]);
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [isObstacleMode, setIsObstacleMode] = useState(false);
  const nodes = useRef<GeoJSONFeature[]>([]);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/nodes`
      );
      const parsedData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      console.log(parsedData);
      if (!parsedData.features) throw new Error("Invalid GeoJSON format");

      nodes.current = parsedData.features;
    } catch (error: any) {
      Alert.alert(
        "Error",
        `Failed to load nodes: ${error.message || "Unknown error"}`
      );
    }
  };

  const toggleObstacle = async (nodeId: string) => {
    const newObstacles = new Set(obstacles);
    if (newObstacles.has(nodeId)) {
      newObstacles.delete(nodeId);
    } else {
      newObstacles.add(nodeId);
    }
    setObstacles(newObstacles);

    try {
      await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/obstacles`,
        { obstacles: Array.from(newObstacles) }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update obstacles");
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
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/shortest_path`,
        { source: source.id, destination: destination.id }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.error);
      } else {
        setPath(
          response.data.path.map(([lat, lon]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          }))
        );

        setExploredEdges(
          response.data.explored.map((edge: [number, number][]) =>
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

  const findNearestNode = (
    latitude: number,
    longitude: number
  ): GeoJSONFeature | null => {
    if (!nodes.current.length) return null;

    let nearestNode = nodes.current[0];
    let minDist = Math.hypot(
      nearestNode.geometry.coordinates[1] - latitude,
      nearestNode.geometry.coordinates[0] - longitude
    );

    nodes.current.forEach((node) => {
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
        ref={mapRef}
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
          const node = nodes.current.find((n) => n.id === nodeId);
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

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "red",
          padding: 15,
          borderRadius: 30,
        }}
        onPress={() => setIsObstacleMode(!isObstacleMode)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {isObstacleMode ? "Stop Obstacle" : "Set Obstacle"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
