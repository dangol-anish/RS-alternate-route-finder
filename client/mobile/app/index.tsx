import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Button,
} from "react-native";
import MapComponent from "@/app/components/MapComponent";
import { useNodes } from "@/app/hooks/useNodes";
import { updateObstacles, fetchShortestPath } from "./utils/api";
import { LatLng } from "react-native-maps";
import HeaderComponent from "@/app/components/HeaderComponent";
import FloatingActionComponent from "./components/FloatingActionComponent";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useMapStore } from "./store/useMapStore";
import { useObstacles } from "./hooks/useObstacles";
// import Menu from "./components/auth/Menu";
import MapView from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { GeoJSONFeature } from "./types/geoJSON";
import Toast from "react-native-toast-message";
import RouteInfoDialog from "./components/RouteInfoDialog";
import { pathDistance } from "./utils/distance";

interface FloatingActionComponentProps {
  onLocateCurrentLocation: () => void;
  clearPath: () => void;
  handleUseMyLocation: () => void;
}

const latLngToGeoJSONFeature = (latlng: {
  latitude: number;
  longitude: number;
}): GeoJSONFeature => ({
  id: "user-location",
  geometry: {
    type: "Point",
    coordinates: [latlng.longitude, latlng.latitude],
  },
});

export default function App() {
  const router = useRouter();
  const { nodes } = useNodes();
  const { obstaclesDb } = useObstacles();
  const mapRef = useRef<MapView | null>(null);

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
    userLocation,
    setUserLocation,
    selectionMode,
  } = useMapStore();

  const [mapRegion, setMapRegion] = useState({
    latitude: 27.7,
    longitude: 85.3,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [showRouteInfo, setShowRouteInfo] = useState(true);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [obstaclePrompt, setObstaclePrompt] = useState<{
    id: string;
    visible: boolean;
  } | null>(null);
  const [promptedObstacles, setPromptedObstacles] = useState<Set<string>>(
    new Set()
  );
  const [initialPathObstacles, setInitialPathObstacles] = useState<Set<string>>(
    new Set()
  );
  const [initialRouteCalculated, setInitialRouteCalculated] = useState(false);
  const [firstPathAcknowledged, setFirstPathAcknowledged] = useState(false);
  const [initialPathObstaclesSnapshot, setInitialPathObstaclesSnapshot] =
    useState<Set<string>>(new Set());

  // Track the last path to robustly reset initialPathObstacles
  const lastPathRef = useRef<LatLng[]>([]);

  //clear path
  const clearPath = () => {
    setSource(null);
    setDestination(null);
    setPath([]);
    setExploredEdges([]);
    setObstacles(new Set());
    setInitialPathObstacles(new Set());
    setFirstPathAcknowledged(false);
    setInitialPathObstaclesSnapshot(new Set());
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
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  useEffect(() => {
    if (source && destination) {
      if (source.id === destination.id) {
        Toast.show({
          type: "error",
          text1: "Invalid Selection",
          text2: "Source and destination can't be the same place",
        });
        return;
      }
      findShortestPath();
      if (!initialRouteCalculated) setInitialRouteCalculated(true);
    }
  }, [source, destination]);

  const getRoutingSource = () => {
    if (userLocation) {
      // Use user location directly if possible
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
    // Fallback to nearest node only if userLocation is available
    if (userLocation) {
      const nearestNode = getNearestNode(userLocation, nodes);
      return nearestNode
        ? {
            latitude: nearestNode.geometry.coordinates[1],
            longitude: nearestNode.geometry.coordinates[0],
          }
        : null;
    }
    return null;
  };

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

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission for location not granted");
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (location) => {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude }); // update the store
        }
      );
    };

    startWatching();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const getNearestNode = (
    userLocation: { latitude: number; longitude: number },
    nodes: any[]
  ) => {
    let minDist = Infinity;
    let nearest = null;
    for (const node of nodes) {
      const [lon, lat] = node.geometry.coordinates;
      const dist = Math.hypot(
        userLocation.latitude - lat,
        userLocation.longitude - lon
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }
    return nearest;
  };

  const handleUseMyLocation = () => {
    if (!userLocation) return;
    const nearestNode = getNearestNode(userLocation, nodes);
    if (!nearestNode) return;
    if (selectionMode === "source") {
      if (destination && destination.id === nearestNode.id) {
        Toast.show({
          type: "error",
          text1: "Invalid Selection",
          text2: "Source and destination can't be the same place",
        });
        return;
      }
      setSource(nearestNode);
    }
    if (selectionMode === "destination") {
      if (source && source.id === nearestNode.id) {
        Toast.show({
          type: "error",
          text1: "Invalid Selection",
          text2: "Source and destination can't be the same place",
        });
        return;
      }
      setDestination(nearestNode);
    }
  };

  useEffect(() => {
    if (source && destination && path.length > 1) {
      setShowRouteInfo(true);
    }
  }, [source, destination, path]);

  async function fetchPlaceName(lat: number, lon: number): Promise<string> {
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      const place = places[0];
      if (!place) return `${lat}, ${lon}`;

      // Compose a readable address
      const parts = [
        place.name,
        place.street,
        place.district,
        place.city,
        // place.region,
        // place.country,
      ].filter(Boolean);

      // Remove duplicates and generic names
      const uniqueParts = Array.from(new Set(parts)).filter(
        (part) =>
          part &&
          !["Unnamed Road", "Unnamed Street", "Unnamed"].includes(part) &&
          !/^[0-9]+$/.test(part) &&
          !/^[23456789CFGHJMPQRVWX]+(\+[23456789CFGHJMPQRVWX]+)?$/.test(part) // Filter Plus Codes
      );

      return uniqueParts.length > 0 ? uniqueParts.join(", ") : `${lat}, ${lon}`;
    } catch {
      return `${lat}, ${lon}`;
    }
  }

  useEffect(() => {
    if (source && source.geometry) {
      const [lon, lat] = source.geometry.coordinates;
      fetchPlaceName(lat, lon).then(setSourceName);
    } else {
      setSourceName(null);
    }
  }, [source]);

  useEffect(() => {
    if (destination && destination.geometry) {
      const [lon, lat] = destination.geometry.coordinates;
      fetchPlaceName(lat, lon).then(setDestinationName);
    } else {
      setDestinationName(null);
    }
  }, [destination]);

  // Utility: Check if a point is near a path (within threshold meters)
  function isPointNearPath(
    point: { latitude: number; longitude: number },
    path: { latitude: number; longitude: number }[],
    threshold = 0.01
  ) {
    return path.some(
      (p: { latitude: number; longitude: number }) =>
        Math.abs(p.latitude - point.latitude) < threshold &&
        Math.abs(p.longitude - point.longitude) < threshold
    );
  }

  // When a new path is set, always record the set of obstacles on the path
  useEffect(() => {
    if (!path.length || !obstaclesDb) return;
    // If the path has changed, reset initialPathObstacles
    if (
      path.length !== lastPathRef.current.length ||
      path.some(
        (p, i) =>
          !lastPathRef.current[i] ||
          p.latitude !== lastPathRef.current[i].latitude ||
          p.longitude !== lastPathRef.current[i].longitude
      )
    ) {
      const currentObstacles = new Set(
        obstaclesDb
          .filter((obstacle) =>
            isPointNearPath(
              { latitude: obstacle.latitude, longitude: obstacle.longitude },
              path
            )
          )
          .map((obstacle) => obstacle.id)
      );
      setInitialPathObstacles(currentObstacles);
      lastPathRef.current = path;
    }
  }, [path, obstaclesDb]);

  // Detect new obstacles on path (not present in initialPathObstacles)
  useEffect(() => {
    if (!firstPathAcknowledged) return;
    if (!path.length || !obstaclesDb) return;
    for (const obstacle of obstaclesDb) {
      if (
        !promptedObstacles.has(obstacle.id) &&
        !initialPathObstaclesSnapshot.has(obstacle.id) &&
        isPointNearPath(
          { latitude: obstacle.latitude, longitude: obstacle.longitude },
          path
        )
      ) {
        setObstaclePrompt({ id: obstacle.id, visible: true });
        break;
      }
    }
  }, [
    obstaclesDb,
    path,
    promptedObstacles,
    initialPathObstaclesSnapshot,
    firstPathAcknowledged,
  ]);

  // Helper to check if user has moved significantly from the original source
  function hasUserMovedFromSource(
    userLocation: LatLng | null,
    source: GeoJSONFeature | null,
    threshold: number = 0.0002
  ): boolean {
    if (!userLocation || !source || !source.geometry) return false;
    const [lon, lat] = source.geometry.coordinates;
    return (
      Math.abs(userLocation.latitude - lat) > threshold ||
      Math.abs(userLocation.longitude - lon) > threshold
    );
  }

  // Handle reroute
  const handleReroute = () => {
    setObstaclePrompt(null);
    if (!obstaclePrompt) return;
    setPromptedObstacles((prev) => new Set(prev).add(obstaclePrompt.id));
    if (!destination) return;
    // Force rerender by cloning the source object
    setSource(source ? { ...source } : null);
    // This will trigger path recalculation
  };

  // Handle ignore
  const handleIgnore = () => {
    setObstaclePrompt(null);
    if (!obstaclePrompt) return;
    setPromptedObstacles((prev) => new Set(prev).add(obstaclePrompt.id));
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderComponent mapRef={mapRef} />
      <MapComponent
        toggleObstacle={toggleObstacle}
        nodes={nodes}
        userLocation={userLocation}
        mapRegion={mapRegion}
        setMapRegion={setMapRegion}
        obstaclesDb={obstaclesDb}
        mapRef={mapRef}
      />
      <FloatingActionComponent
        onLocateCurrentLocation={locateCurrentLocation}
        clearPath={clearPath}
        onUseMyLocation={handleUseMyLocation}
      />
      {(selectionMode === "source" || selectionMode === "destination") && (
        <TouchableOpacity
          style={styles.bottomLeftButton}
          onPress={handleUseMyLocation}
        >
          <MaterialIcons name="gps-fixed" size={24} color="#4682B4" />
        </TouchableOpacity>
      )}
      {source && destination && path.length > 1 && showRouteInfo && (
        <RouteInfoDialog
          sourceName={sourceName || source.properties?.name || source.id}
          destinationName={
            destinationName || destination.properties?.name || destination.id
          }
          distanceKm={pathDistance(path)}
          onClose={() => {
            setShowRouteInfo(false);
            if (!firstPathAcknowledged) {
              setFirstPathAcknowledged(true);
              // Take a snapshot of obstacles on the path at this moment
              const snapshot = new Set(
                obstaclesDb
                  .filter((obstacle) =>
                    isPointNearPath(
                      {
                        latitude: obstacle.latitude,
                        longitude: obstacle.longitude,
                      },
                      path
                    )
                  )
                  .map((obstacle) => obstacle.id)
              );
              setInitialPathObstaclesSnapshot(snapshot);
            }
          }}
        />
      )}
      <Modal
        visible={!!obstaclePrompt?.visible}
        transparent
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              width: 300,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Obstacle Detected!
            </Text>
            <Text
              style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}
            >
              An obstacle has been detected on your route to the destination.
              Would you like to reroute?
            </Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Button title="Show New Route" onPress={handleReroute} />
              <Button title="Ignore" onPress={handleIgnore} color="#888" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  useMyLocationButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLeftButton: {
    position: "absolute",
    left: 16,
    bottom: 30, // adjust as needed to sit above the menu bar
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
