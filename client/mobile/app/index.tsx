import React, { useState, useEffect, useRef } from "react";
import { View, Alert } from "react-native";
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
      if (!parsedData.features) throw new Error("Invalid GeoJSON format");

      nodes.current = parsedData.features;
    } catch (error: any) {
      Alert.alert(
        "Error",
        `Failed to load nodes: ${error.message || "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    if (source && destination) {
      console.log("Calling findShortestPath with:", { source, destination });
      findShortestPath();
    }
  }, [source, destination]); // Runs when source or destination changes

  const findShortestPath = async () => {
    if (!source || !destination) {
      Alert.alert("Error", "Source or Destination is missing!");
      console.log("Source:", source, "Destination:", destination);
      return;
    }
    try {
      console.log("Fetching shortest path for:", source.id, destination.id);
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/shortest_path`,
        {
          source: source.id,
          destination: destination.id,
        }
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

        // setExploredEdges(
        //   response.data.explored.map((edge: [number, number][]) =>
        //     edge.map(([lat, lon]) => ({ latitude: lat, longitude: lon }))
        //   )
        // );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to find shortest path" + error);
    }
  };

  const findNearestNode = (
    latitude: number,
    longitude: number
  ): GeoJSONFeature | null => {
    if (!nodes.current.length) {
      console.log("No nodes available");
      return null;
    }

    console.log("Finding nearest node for:", latitude, longitude);

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

    console.log("Nearest node found:", nearestNode);
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
          if (!nodes.current.length) {
            Alert.alert("Error", "Nodes are not loaded yet!");
            return;
          }

          const { latitude, longitude } = event.nativeEvent.coordinate;
          console.log("Clicked Location:", { latitude, longitude });

          const closestNode = findNearestNode(latitude, longitude);

          if (!closestNode) {
            Alert.alert("Error", "No closest node found!");
            console.log("No closest node found!");
            return;
          }

          if (!source) {
            console.log("Setting source:", closestNode);
            setSource(closestNode);
          } else if (!destination) {
            console.log("Setting destination:", closestNode);
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

        {exploredEdges.map((edge, index) => (
          <Polyline
            key={index}
            coordinates={edge}
            strokeColor="yellow"
            strokeWidth={3}
          />
        ))}

        {path.length > 0 && (
          <Polyline coordinates={path} strokeColor="blue" strokeWidth={5} />
        )}
      </MapView>
    </View>
  );
}
