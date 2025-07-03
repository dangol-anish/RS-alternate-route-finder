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
import FloatingActionComponent from "./components/FloatingActionComponent";
import * as Location from "expo-location";
import { useRouter, usePathname } from "expo-router";
import { useMapStore } from "./store/useMapStore";
import { useObstacles } from "./hooks/useObstacles";
// import Menu from "./components/auth/Menu";
import MapView from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { GeoJSONFeature } from "./types/geoJSON";
import Toast from "react-native-toast-message";
import RouteInfoDialog from "./components/RouteInfoDialog";
import { pathDistance } from "./utils/distance";
import { themeColors } from "./styles/colors";
import SearchOverlay from "@/app/components/search/SearchOverlay";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { IP_ADDRESS } from "../constants/IPAddress";

interface FloatingActionComponentProps {
  onLocateCurrentLocation: () => void;
  clearPath: () => void;
  handleUseMyLocation: () => void;
  onSearchPress: () => void;
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

// Place name cache
const placeNameCache: Record<string, string> = {};

async function fetchPlaceName(
  lat: number,
  lon: number,
  retries = 2
): Promise<string> {
  const key = `${lat},${lon}`;
  if (placeNameCache[key]) {
    return placeNameCache[key];
  }
  try {
    console.log("fetchPlaceName called with:", lat, lon);
    const places = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    });
    const place = places[0];
    if (!place) {
      console.log("No place found for:", lat, lon);
      if (retries > 0) {
        // Retry after a short delay
        await new Promise((res) => setTimeout(res, 300));
        return fetchPlaceName(lat, lon, retries - 1);
      }
      // Use cache if available
      if (placeNameCache[key]) {
        return placeNameCache[key];
      }
      return `${lat}, ${lon}`;
    }

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

    const name =
      uniqueParts.length > 0 ? uniqueParts.join(", ") : `${lat}, ${lon}`;
    placeNameCache[key] = name;
    console.log("fetchPlaceName result:", name);
    return name;
  } catch (e) {
    console.log("fetchPlaceName error for:", lat, lon, e);
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, 300));
      return fetchPlaceName(lat, lon, retries - 1);
    }
    if (placeNameCache[key]) {
      return placeNameCache[key];
    }
    return `${lat}, ${lon}`;
  }
}

export default function App() {
  const router = useRouter();
  const pathname = usePathname();
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
    setSelectionMode,
    selectedObstacleCoord,
  } = useMapStore();

  const [mapRegion, setMapRegion] = useState({
    latitude: 27.7,
    longitude: 85.3,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [promptedObstacles, setPromptedObstacles] = useState(new Set<string>());
  const [obstaclePrompt, setObstaclePrompt] = useState<{
    id: string;
    visible: boolean;
  } | null>(null);
  const [initialPathObstacles, setInitialPathObstacles] = useState<Set<string>>(
    new Set()
  );

  const mapZoomedToUser = useRef(false);
  const [justCleared, setJustCleared] = useState(false);

  // Debug: log obstacle statuses
  console.log(
    "obstaclesDb",
    obstaclesDb.map((o) => ({ id: o.id, status: o.status }))
  );

  // Filter out expired obstacles
  const activeObstacles = obstaclesDb.filter(
    (obstacle) => obstacle.status !== "expired"
  );
  // Debug: log filtered active obstacles
  console.log(
    "activeObstacles",
    activeObstacles.map((o) => ({ id: o.id, status: o.status }))
  );

  //clear path
  const clearPath = () => {
    setSource(null);
    setDestination(null);
    setPath([]);
    setExploredEdges([]);
    setObstacles(new Set());
    setInitialPathObstacles(new Set());
    setJustCleared(true);
    setSelectionMode("none");
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
    if (justCleared) return;
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
    }
  }, [source, destination, justCleared]);

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
    console.log(
      "🔍 Finding shortest path from",
      source.id,
      "to",
      destination.id
    );
    try {
      const response = await fetchShortestPath(source.id, destination.id);

      if (response.error) {
        console.log("❌ Pathfinding error:", response.error);
        Alert.alert("Error", response.error);
      } else {
        console.log("✅ Path found with", response.path.length, "coordinates");
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
      console.log("❌ Pathfinding exception:", error);
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

  useEffect(() => {
    let isActive = true;
    if (source && source.geometry) {
      const [lon, lat] = source.geometry.coordinates;
      console.log("Setting sourceName for:", lat, lon, source);
      fetchPlaceName(lat, lon).then((name) => {
        if (isActive) setSourceName(name);
      });
    } else {
      setSourceName(null);
    }
    if (destination && destination.geometry) {
      const [lon, lat] = destination.geometry.coordinates;
      console.log("Setting destinationName for:", lat, lon, destination);
      fetchPlaceName(lat, lon).then((name) => {
        if (isActive) setDestinationName(name);
      });
    } else {
      setDestinationName(null);
    }
    return () => {
      isActive = false;
    };
  }, [source, destination, path]);

  // Utility: Check if a point is near a path (within threshold meters)
  function isPointNearPath(
    point: { latitude: number; longitude: number },
    path: { latitude: number; longitude: number }[],
    threshold = 0.0001 // Approx 11 meters
  ) {
    return path.some(
      (p: { latitude: number; longitude: number }) =>
        Math.abs(p.latitude - point.latitude) < threshold &&
        Math.abs(p.longitude - point.longitude) < threshold
    );
  }

  // Detect new obstacles on path (not present in initialPathObstacles)
  useEffect(() => {
    if (!path.length || !obstaclesDb) return;
    for (const obstacle of obstaclesDb) {
      if (
        !promptedObstacles.has(obstacle.id) &&
        !initialPathObstacles.has(obstacle.id) &&
        isPointNearPath(
          { latitude: obstacle.latitude, longitude: obstacle.longitude },
          path
        )
      ) {
        setObstaclePrompt({ id: obstacle.id, visible: true });
        break;
      }
    }
  }, [obstaclesDb, path, promptedObstacles, initialPathObstacles]);

  function resetObstaclePromptState() {
    setPromptedObstacles(new Set());
  }

  useEffect(() => {
    resetObstaclePromptState();
    if (source && destination && path.length > 1) {
      setShowRouteInfo(true);
      // When a new route is set, record the obstacles currently on it.
      const initialObstacles = new Set(
        obstaclesDb
          .filter((obstacle) =>
            isPointNearPath(
              { latitude: obstacle.latitude, longitude: obstacle.longitude },
              path
            )
          )
          .map((obstacle) => obstacle.id)
      );
      setInitialPathObstacles(initialObstacles);
    }
  }, [source, destination, path, obstaclesDb]);

  // Handle reroute
  const handleReroute = () => {
    console.log("🔄 Reroute triggered for obstacle:", obstaclePrompt?.id);
    setObstaclePrompt(null);
    if (!obstaclePrompt) {
      console.log("❌ No obstacle prompt found");
      return;
    }
    setPromptedObstacles((prev) => new Set(prev).add(obstaclePrompt.id));
    if (!source || !destination) {
      console.log("❌ Source or destination missing:", {
        source: !!source,
        destination: !!destination,
      });
      return;
    }

    console.log("🗺️ Finding new path from", source.id, "to", destination.id);

    // Clear current path to trigger new route calculation
    setPath([]);
    setExploredEdges([]);

    // Find new path that avoids the obstacle
    findShortestPath();
  };

  // Handle ignore
  const handleIgnore = () => {
    setObstaclePrompt(null);
    if (!obstaclePrompt) return;
    setPromptedObstacles((prev) => new Set(prev).add(obstaclePrompt.id));
  };

  // Hide RouteInfoDialog when not on the Explore tab
  useEffect(() => {
    if (pathname !== "/") {
      setShowRouteInfo(false);
    }
  }, [pathname]);

  // Pan to user location on first load, unless an obstacle is selected
  useEffect(() => {
    if (
      userLocation &&
      mapRef.current &&
      !mapZoomedToUser.current &&
      !selectedObstacleCoord
    ) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      mapZoomedToUser.current = true;
    }
  }, [userLocation, selectedObstacleCoord]);

  // Search overlay state
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    const url = `${IP_ADDRESS}/ping`;
    console.log("Testing API connectivity. URL:", url);
    fetch(url)
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        console.log("Ping success:", data);
      })
      .catch((error) => {
        console.log("Ping error:", error);
        if (error.response) {
          console.log("Error response:", error.response);
        }
        if (error.request) {
          console.log("Error request:", error.request);
        }
        if (error.config) {
          console.log("Error config:", error.config);
        }
      });
  }, []);

  useEffect(() => {
    const url = `${IP_ADDRESS}/map_boundary`;
    console.log("Testing /map_boundary. URL:", url);
    fetch(url)
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        console.log("Boundary result:", data);
      })
      .catch((error) => {
        console.log("Boundary error:", error);
        if (error.response) {
          console.log("Error response:", error.response);
        }
        if (error.request) {
          console.log("Error request:", error.request);
        }
        if (error.config) {
          console.log("Error config:", error.config);
        }
      });
  }, []);

  // When user selects a new source or destination, reset justCleared
  useEffect(() => {
    if (justCleared && (source || destination)) {
      setJustCleared(false);
    }
  }, [source, destination]);

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.off_white }}>
      <StatusBar hidden={showSearchOverlay} />
      <MapComponent
        toggleObstacle={toggleObstacle}
        nodes={nodes}
        userLocation={userLocation}
        mapRegion={mapRegion}
        setMapRegion={setMapRegion}
        obstaclesDb={activeObstacles}
        mapRef={mapRef}
        onRoutePress={() => setShowRouteInfo(true)}
        mapZoomedToUser={mapZoomedToUser}
      />
      <FloatingActionComponent
        onLocateCurrentLocation={locateCurrentLocation}
        clearPath={clearPath}
        onUseMyLocation={handleUseMyLocation}
        onSearchPress={() => setShowSearchOverlay(true)}
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
              backgroundColor: themeColors.off_white,
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              width: 330,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Obstacle Detected!
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              An obstacle has been detected on your route to the destination.
              Would you like to reroute?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleReroute}
              >
                <Text style={styles.buttonText}>Redirect</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleIgnore}
              >
                <Text style={styles.buttonText}>Ignore</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Search Overlay Modal */}
      <SearchOverlay
        visible={showSearchOverlay}
        searchText={searchText}
        onChangeText={setSearchText}
        onClear={() => setSearchText("")}
        onClose={() => setShowSearchOverlay(false)}
        inputRef={searchInputRef}
        onResultPress={({ latitude, longitude }) => {
          setShowSearchOverlay(false);
          setSearchText("");
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }}
      />
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

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 16, // if your React Native version supports it
  },
  primaryButton: {
    flex: 1,
    backgroundColor: themeColors.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
